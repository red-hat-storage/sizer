import express from "express";
import {
  ClusterSizer,
  getNodeKubeletCPURequirements,
  getNodeKubeletMemoryRequirements,
} from "@redhat/cluster-sizer";
import type {
  WorkloadDescriptor,
  MachineSet,
  Platform,
  Node,
  Zone,
  Service,
} from "@redhat/cluster-sizer";

const app = express();
// Increase body size limit to handle large payloads (e.g., 100k VMs = ~1MB)
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 9000;

// Helper function to build advanced/detailed results
function buildAdvancedResults(
  zones: Zone[],
  nodes: Node[],
  services: Service[]
) {
  return zones.map((zone, index) => {
    const zoneNodes = nodes.filter((node) => zone.nodes.includes(node.id));

    return {
      zone: `Zone ${index + 1}`,
      nodes: zoneNodes.map((node, nodeIndex) => {
        // Find services on this node
        const nodeServices = services.filter(
          (service) =>
            service.id !== undefined && node.services.includes(service.id)
        );

        // Calculate used resources (requests)
        const requestedCPU = nodeServices.reduce(
          (sum, s) => sum + s.requiredCPU,
          0
        );
        const requestedMemory = nodeServices.reduce(
          (sum, s) => sum + s.requiredMemory,
          0
        );
        const usedDisks = 0; // Disk tracking not implemented yet

        // Calculate limits (if any services have limits)
        const limitCPU = nodeServices.reduce(
          (sum, s) => sum + (s.limitCPU ?? s.requiredCPU),
          0
        );
        const limitMemory = nodeServices.reduce(
          (sum, s) => sum + (s.limitMemory ?? s.requiredMemory),
          0
        );

        // Check if any service has over-commitment
        const hasOverCommit = nodeServices.some(
          (s) => s.limitCPU || s.limitMemory
        );

        // Build response with over-commit info if present
        const nodeResponse: any = {
          node: `Node ${nodeIndex + 1}`,
          machineSet: node.machineSet,
          isControlPlane: node.isControlPlane || false,
          resources: {
            cpu: {
              requested: requestedCPU,
              total: node.cpuUnits,
            },
            memory: {
              requested: parseFloat(requestedMemory.toFixed(2)),
              total: node.memory,
            },
            disks: {
              used: usedDisks,
              total: node.maxDisks,
            },
          },
          services: nodeServices.map((s) => s.name),
        };

        // Add limit info if over-commitment is present
        if (hasOverCommit) {
          nodeResponse.resources.cpu.limits = limitCPU;
          nodeResponse.resources.memory.limits = parseFloat(
            limitMemory.toFixed(2)
          );

          // Calculate over-commit ratios against AVAILABLE resources (after kubelet overhead)
          const kubeletCPU = getNodeKubeletCPURequirements(node.cpuUnits);
          const kubeletMemory = getNodeKubeletMemoryRequirements(node.memory);
          const availableCPU = node.cpuUnits - kubeletCPU;
          const availableMemory = node.memory - kubeletMemory;

          if (availableCPU > 0) {
            nodeResponse.resources.cpu.overCommitRatio = parseFloat(
              (limitCPU / availableCPU).toFixed(2)
            );
          }

          if (availableMemory > 0) {
            nodeResponse.resources.memory.overCommitRatio = parseFloat(
              (limitMemory / availableMemory).toFixed(2)
            );
          }
        }

        return nodeResponse;
      }),
    };
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "sizer-library", version: "1.0.0" });
});

// Custom workload sizing endpoint
app.post("/api/v1/size/custom", (req, res) => {
  try {
    const { platform, machineSets, workloads, detailed } = req.body as {
      platform: Platform;
      machineSets?: MachineSet[];
      workloads: WorkloadDescriptor[];
      detailed?: boolean;
    };

    // Validation
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: "platform is required",
      });
    }

    if (!workloads || workloads.length === 0) {
      return res.status(400).json({
        success: false,
        error: "workloads are required",
      });
    }

    // Calculate sizing using the library
    const sizing = ClusterSizer.size(workloads, platform, machineSets);

    // Debug logging for large payloads
    console.log(`Sizing calculation completed:`);
    console.log(`  Node count: ${sizing.nodeCount}`);
    console.log(`  Zones: ${sizing.zones}`);
    console.log(`  Total CPU: ${sizing.totalCPU}`);
    console.log(`  Total Memory: ${sizing.totalMemory}`);
    console.log(`  Nodes array length: ${sizing.nodes?.length || 0}`);
    console.log(`  Services array length: ${sizing.services?.length || 0}`);

    // Calculate resource consumption from all nodes (matches UI display)
    const allNodes = sizing.nodes || [];
    const allServices = sizing.services || [];

    let totalRequestedCPU = 0;
    let totalRequestedMemory = 0;
    let totalLimitCPU = 0;
    let totalLimitMemory = 0;
    let hasOverCommit = false;

    // Sum up resources directly from all nodes
    allNodes.forEach((node) => {
      // Get all services on this node
      const nodeServices = allServices.filter((s) =>
        node.services?.some((nodeServiceId) => nodeServiceId === s.id)
      );

      nodeServices.forEach((s) => {
        totalRequestedCPU += s.requiredCPU;
        totalRequestedMemory += s.requiredMemory;
        totalLimitCPU += s.limitCPU ?? s.requiredCPU;
        totalLimitMemory += s.limitMemory ?? s.requiredMemory;
        if (s.limitCPU || s.limitMemory) {
          hasOverCommit = true;
        }
      });
    });

    const totalRequested = {
      cpu: totalRequestedCPU,
      memory: totalRequestedMemory,
    };
    const totalLimits = {
      cpu: totalLimitCPU,
      memory: totalLimitMemory,
    };

    // Build response
    const response: any = {
      nodeCount: sizing.nodeCount,
      zones: sizing.zones,
      totalCPU: sizing.totalCPU,
      totalMemory: sizing.totalMemory,
      // Resource consumption (matches UI display)
      resourceConsumption: {
        cpu: parseFloat(totalRequested.cpu.toFixed(2)),
        memory: parseFloat(totalRequested.memory.toFixed(2)),
      },
    };

    // Add over-commitment info if present
    if (hasOverCommit) {
      // Calculate available resources after kubelet overhead (matches UI calculation)
      const totalAvailableCPU = allNodes.reduce((sum, node) => {
        const kubeletCPU = getNodeKubeletCPURequirements(node.cpuUnits);
        return sum + (node.cpuUnits - kubeletCPU);
      }, 0);

      const totalAvailableMemory = allNodes.reduce((sum, node) => {
        const kubeletMemory = getNodeKubeletMemoryRequirements(node.memory);
        return sum + (node.memory - kubeletMemory);
      }, 0);

      response.resourceConsumption.limits = {
        cpu: parseFloat(totalLimits.cpu.toFixed(2)),
        memory: parseFloat(totalLimits.memory.toFixed(2)),
      };
      response.resourceConsumption.overCommitRatio = {
        cpu: parseFloat((totalLimits.cpu / totalAvailableCPU).toFixed(2)),
        memory: parseFloat(
          (totalLimits.memory / totalAvailableMemory).toFixed(2)
        ),
      };
    }

    // Add detailed information if requested
    if (detailed) {
      console.log("Detailed requested");
      console.log("Nodes:", sizing.nodes?.length);
      console.log("Zones:", sizing.zoneDetails?.length);
      console.log("Services:", sizing.services?.length);

      if (sizing.nodes && sizing.zoneDetails && sizing.services) {
        response.advanced = buildAdvancedResults(
          sizing.zoneDetails,
          sizing.nodes,
          sizing.services
        );
      }
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("Error calculating cluster size:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Sizer service listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Custom sizing API: http://localhost:${PORT}/api/v1/size/custom`);
});
