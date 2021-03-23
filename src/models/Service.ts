abstract class Service {
  requiredMemory: number;
  requiredCPU: number;

  constructor(deploymentType: string) {
    deploymentType;
    this.requiredCPU = 0;
    this.requiredMemory = 0;
  }

  abstract getDetails(): string;
}

export class NooBaa_DB extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 4;
        this.requiredCPU = 0.5;
        break;
    }
  }

  getDetails(): string {
    return "NooBaa DB";
  }
}

export class NooBaa_Endpoint extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 2;
        this.requiredCPU = 1;
        break;
    }
  }

  getDetails(): string {
    return "NooBaa Endpoint";
  }
}

export class Ceph_MDS extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/ceph/ceph-ansible/blob/246e31c0d3c3dd16cdcf2a1e6d54e85c857ff8bd/roles/ceph-mds/defaults/main.yml#L22-L23
      case "external":
        this.requiredMemory = 8;
        this.requiredCPU = 4;
        break;
      // https://github.com/openshift/console/blob/master/frontend/packages/ceph-storage-plugin/src/components/ocs-install/ocs-request-data.ts#L26
      case "minimal":
      case "compact":
        this.requiredMemory = 8;
        this.requiredCPU = 1;
        break;
      default:
        this.requiredMemory = 8;
        this.requiredCPU = 3;
        break;
    }
  }

  getDetails(indentation = ""): string {
    return indentation + "Ceph MDS";
  }
}

export class Ceph_MGR extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 3.5;
        this.requiredCPU = 1;
        break;
    }
  }

  getDetails(): string {
    return "Ceph MGR";
  }
}

export class Ceph_MON extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/ceph/ceph-ansible/blob/246e31c0d3c3dd16cdcf2a1e6d54e85c857ff8bd/roles/ceph-mon/defaults/main.yml#L40-L41
      case "external":
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 2;
        this.requiredCPU = 1;
        break;
    }
  }

  getDetails(): string {
    return "Ceph MON";
  }
}

export class Ceph_OSD extends Service {
  constructor(deploymentType: string, nvmeTuning: boolean) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/openshift/console/blob/master/frontend/packages/ceph-storage-plugin/src/components/ocs-install/ocs-request-data.ts#L26
      case "minimal":
      case "compact":
        this.requiredMemory = 5;
        this.requiredCPU = 1;
        break;
      // https://github.com/ceph/ceph-ansible/blob/246e31c0d3c3dd16cdcf2a1e6d54e85c857ff8bd/roles/ceph-osd/defaults/main.yml#L164-L165
      case "external":
        this.requiredMemory = 5;
        this.requiredCPU = 4;
        break;
      default:
        this.requiredMemory = 5;
        this.requiredCPU = 2;
        break;
    }
    if (nvmeTuning) {
      // https://docs.google.com/document/d/1zqckcf4NllPvcKEHBs4wOzReG55P_GwvxdJ-1QajreY/edit#
      this.requiredCPU = 5;
    }
  }

  getDetails(): string {
    return "Ceph OSD";
  }
}

export class Ceph_RGW extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      // https://github.com/ceph/ceph-ansible/blob/246e31c0d3c3dd16cdcf2a1e6d54e85c857ff8bd/roles/ceph-rgw/defaults/main.yml#L83-L84
      case "external":
        this.requiredMemory = 4;
        this.requiredCPU = 8;
        break;
      // https://github.com/openshift/console/blob/master/frontend/packages/ceph-storage-plugin/src/components/ocs-install/ocs-request-data.ts#L26
      case "minimal":
      case "compact":
        this.requiredMemory = 4;
        this.requiredCPU = 1;
        break;
      default:
        this.requiredMemory = 4;
        this.requiredCPU = 2;
        break;
    }
  }

  getDetails(): string {
    return "Ceph RGW";
  }
}

export class NooBaa_core extends Service {
  constructor(deploymentType: string) {
    super(deploymentType);
    switch (deploymentType) {
      case "minimal":
      case "compact":
      default:
        this.requiredMemory = 4;
        this.requiredCPU = 1;
        break;
    }
  }

  getDetails(): string {
    return "NooBaa Core";
  }
}

export default Service;
