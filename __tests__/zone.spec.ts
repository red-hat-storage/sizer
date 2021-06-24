import { BareMetal } from "../src/models/Node";
import { Service } from "../src/models/Service";
import { generateRandomString } from "../src/models/util";
import { Workload } from "../src/models/Workload";
import { Zone } from "../src/models/Zone";

describe("Test Zones", () => {
  let zone: Zone;
  beforeAll(() => {
    zone = new Zone([new BareMetal()], generateRandomString());
  });

  it("Test getTotalUsedCPU", () => {
    expect(zone.getTotalUsedCPU()).toEqual(0);
    const workload = new Workload(
      "workload-a",
      [new Service("a", 3, 3, 3, [], [])],
      0
    );
    zone.nodes[0].addWorkload(workload, workload.name);
    // ( 2 * round(ceil(3) / 2)) = 4
    expect(zone.getTotalUsedCPU()).toEqual(4);
  });
});
