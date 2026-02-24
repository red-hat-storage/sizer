import {
  WorkloadDescriptor,
  MachineSet,
  Platform,
  Zone,
  Node,
  Service,
  Workload,
} from "../types";
import { workloadScheduler } from "../scheduler";
import { getDefaultInstanceForPlatform } from "../data";
import { getWorkloadFromDescriptors, isWorkloadSchedulable } from "../utils/workload";
import { getNodeKubeletCPURequirements, getNodeKubeletMemoryRequirements } from "../utils/kubelet";

export type ClusterSizing = {
  nodeCount: number;
  zones: number;
  totalCPU: number;
  totalMemory: number;
  nodes?: Node[];
  zoneDetails?: Zone[];
  services?: Service[];
};

export class ClusterSizer {
  /**
   * Main sizing function
   * @param workloads Array of workload descriptors
   * @param platform Target platform (AWS, Azure, GCP, BareMetal, etc.)
   * @param machineSets Optional custom machine sets (uses platform defaults if not provided)
   */
  static size(
    workloads: WorkloadDescriptor[],
    platform: Platform,
    machineSets?: MachineSet[]
  ): ClusterSizing {
    let zones: Zone[] = [];
    let nodes: Node[] = [];
    const allServices: Service[] = [];
    const allWorkloads: Workload[] = [];

    // Use provided machineSets or get platform defaults
    const availableMachineSets =
      machineSets || this.getDefaultMachineSets(platform);

    // Convert workload descriptors to workloads and services
    // Expand workloads based on count field (create duplicates if count > 1)
    workloads.forEach((workloadDesc) => {
      // If count > 1, set zones = count to distribute replicas across zones
      const adjustedWorkloadDesc = workloadDesc.count > 1 ? {
        ...workloadDesc,
        services: workloadDesc.services.map(s => ({
          ...s,
          zones: workloadDesc.count  // Set zones to match count for distribution
        }))
      } : workloadDesc;
      
      const { workload, services } = getWorkloadFromDescriptors(adjustedWorkloadDesc);
      allWorkloads.push(workload);
      allServices.push(...services);
    });

    // Validate that all workloads can be scheduled on available machine sets
    this.validateWorkloadsCanSchedule(allWorkloads, allServices, availableMachineSets);

    // Schedule each workload
    const usedZonesId: number[] = [];
    allWorkloads.forEach((workload) => {
      const result = workloadScheduler(
        workload,
        allServices,
        availableMachineSets,
        zones,
        nodes,
        usedZonesId
      );
      zones = result.zones;
      nodes = result.nodes;
    });

    return {
      nodeCount: nodes.length,
      zones: zones.length,
      totalCPU: nodes.reduce((sum, n) => sum + n.cpuUnits, 0),
      totalMemory: nodes.reduce((sum, n) => sum + n.memory, 0),
      nodes,
      zoneDetails: zones,
      services: allServices,
    };
  }

  /**
   * Validate that all workloads can be scheduled on available machine sets
   * Uses the same logic as the UI to check scheduling constraints (usesMachines, allowWorkloadScheduling, etc.)
   * @param workloads Array of workloads to validate
   * @param services Array of all services
   * @param machineSets Array of available machine sets
   * @throws Error if any workload cannot be scheduled on any machine set
   */
  private static validateWorkloadsCanSchedule(
    workloads: Workload[],
    services: Service[],
    machineSets: MachineSet[]
  ): void {
    const checkSchedulable = isWorkloadSchedulable(services, machineSets);
    
    for (const workload of workloads) {
      const [isSchedulable, availableMachineSets] = checkSchedulable(workload);
      
      if (!isSchedulable) {
        // Find the machineset that the workload should use
        const targetMachineSet = workload.usesMachines.length > 0
          ? machineSets.find(ms => workload.usesMachines.includes(ms.name))
          : machineSets.find(ms => 
              ms.name !== 'controlPlane' && 
              ms.name !== 'control-plane' &&
              (ms.onlyFor.length === 0 || ms.onlyFor.includes(workload.name))
            ) || machineSets[0];
        
        // Get workload services to show resource requirements
        const workloadServices = services.filter(s => 
          s.id !== undefined && workload.services.includes(s.id)
        );
        
        const totalCPU = workloadServices.reduce((sum, s) => sum + s.requiredCPU, 0);
        const totalMemory = workloadServices.reduce((sum, s) => sum + s.requiredMemory, 0);
        
        // Calculate kubelet overhead to determine minimum requirements
        const kubeletCPU = getNodeKubeletCPURequirements(targetMachineSet?.cpu || 0);
        const kubeletMemory = getNodeKubeletMemoryRequirements(targetMachineSet?.memory || 0);
        
        const totalRequiredCPU = totalCPU + kubeletCPU;
        const totalRequiredMemory = totalMemory + kubeletMemory;
        
        const machineSetName = targetMachineSet?.name || 'available machine set';
        const machineSetCPU = targetMachineSet?.cpu || 0;
        const machineSetMemory = targetMachineSet?.memory || 0;
        
        // Calculate minimum required machineset size
        // Round CPU up to nearest multiple of 2 (max 200)
        // Round Memory up to nearest multiple of 4 (max 512)
        const minRequiredCPU = Math.min(200, Math.ceil(totalRequiredCPU / 2) * 2);
        const minRequiredMemory = Math.min(512, Math.ceil(totalRequiredMemory / 4) * 4);
        
        throw new Error(
          `Workload "${workload.name}" is not schedulable. ` +
          `All available MachineSets are too small to run this workload. ` +
          `Minimum required: at least ${minRequiredCPU} CPU and ${minRequiredMemory} GB memory.`
        );
      }
    }
  }

  /**
   * Get default machine sets for a platform
   */
  private static getDefaultMachineSets(platform: Platform): MachineSet[] {
    const defaultInstance = getDefaultInstanceForPlatform(platform);

    return [
      {
        name: "default",
        cpu: defaultInstance.cpuUnits,
        memory: defaultInstance.memory,
        instanceName: defaultInstance.name,
        numberOfDisks: defaultInstance.maxDisks || 24,
        onlyFor: [],
        label: "Worker Node",
      },
    ];
  }
}
