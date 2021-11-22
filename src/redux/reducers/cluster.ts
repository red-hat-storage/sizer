import { createAction, createReducer } from "@reduxjs/toolkit";
import { Zone_ as Zone } from "../../models";
import { Platform } from "../../types";

const defaultState = {
  platform: Platform.AWS,
  zones: [] as Zone[],
};

const setPlatform = createAction<Platform>("SET_PLATFORM");

const clusterReducer = createReducer(defaultState, (builder) => {
  builder.addCase(setPlatform, (state, { payload: platform }) => {
    state.platform = platform;
  });
});

export { setPlatform, clusterReducer };

/* const addWorkloadLogic = (zones: Zone[], workload: Workload): Zone[] => {
  const workloads: Workload[] = [];
  _.times(workload.count, (index) => {
    const wl = _.cloneDeep(workload)
    wl.name = `${wl.name}-${index}`
    workloads.push(wl);
  });
  workloads.forEach((wl) => {
    const handledServices: string[] = [];

    Object.entries(workload.services).forEach(([name, service]) => {
      if (!handledServices.includes(name)) {
        // The services in the serviceBundle might have different zones settings
        // We chose to look for the highest zone setting and deploy some services more often than requested
        // So that these services are actually deployed together all the time
        const { serviceBundle, serviceBundleZones } = service.runsWith.reduce(
          ({ serviceBundle, serviceBundleZones }, colocatedServiceName) => {
            const colocatedService = _.find(
              workload.services,
              (s) => s.name === colocatedServiceName
            );
            // We assume that service names are checked when we import the workload
            // Else this could fail when the name is not actually in the service dict
            serviceBundle.push(colocatedService as Service);
            handledServices.push(colocatedServiceName);
            return {
              serviceBundle,
              serviceBundleZones: Math.max(
                serviceBundleZones,
                (colocatedService as Service).zones
              ),
            };
          },
          { serviceBundle: [service], serviceBundleZones: service.zones }
        );
        const usedZones: Zone[] = [];
        for (let i = 0; i < serviceBundleZones; i++) {
          const zone = getSmallestZone(usedZones, []);
          usedZones.push(zone);
          addServicesInZone(serviceBundle, workload, workloadName, zone);
        }
      }
    });
  })
}
const addServicesInZone = (
  services: Service[],
  workload: Workload,
  workloadName: string,
  zone: Zone,
  machineSets: { [key: string]: MachineSet }
): Node => {
  const serviceBundle: Workload = Object.assign({}, workload, { services });
  for (let i = 0; i < zone.nodes.length; i++) {
    const node = zone.nodes[i];
    // if the workload is machineset specific and this node is not of that machineset, skip the node
    if (
      workload?.usesMachines?.length > 0 &&
      !workload?.usesMachines?.includes(node.machineSet)
    ) {
      continue;
    }
    const machineset = machineSets[node.machineSet];
    // if the machineset is workload specific and this workload is not mentioned in the machineset, skip the node
    if (
      machineset.onlyFor.length > 0 &&
      !machineset.onlyFor.includes(workload.name)
    ) {
      continue;
    }
    // when we reach this, the node is suitable for this service/workload - now we have to figure out if our services fit on the node
    if (!addWorkload(serviceBundle, workloadName)) {
      continue;
    }
    return node;
  }
  // When we reach this, there was no node in this zone that can fit out service/workload combo - so we have to add a node
  // First we try to figure out if the workload wants a specific machineSet
  // If the workload is not specific, we try to find a machineSet that fits our needs
  let newNode = new BareMetal();
  let foundNewNode = false;
  for (let i = 0; i < workload?.usesMachines?.length; i++) {
    const machineset = this.machineSets[workload?.usesMachines[i]];
    newNode = getNewNode(machineset, this.platform);

    if (newNode.addWorkload(serviceBundle, workloadName)) {
      foundNewNode = true;
      break;
    }
  }
  if (!foundNewNode) {
    // Look if there is a machineSet for this workload, then use that
    for (const [, machineSet] of Object.entries(this.machineSets)) {
      if (machineSet.onlyFor.includes(workload.name)) {
        newNode = getNewNode(machineSet, this.platform);

        if (newNode.addWorkload(serviceBundle, workloadName)) {
          foundNewNode = true;
          break;
        }
      }
    }
  }
  if (!foundNewNode) {
    // Use a generic workload to get a new node
    for (const [, machineSet] of Object.entries(this.machineSets)) {
      if (machineSet.onlyFor.length == 0) {
        newNode = getNewNode(machineSet, this.platform);

        if (newNode.addWorkload(serviceBundle, workloadName)) {
          foundNewNode = true;
          break;
        }
      }
    }
  }
  zone.nodes.push(newNode);
  return newNode;
} */
