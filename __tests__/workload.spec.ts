import { Service } from "../src/models/Service";
import { Workload } from "../src/models/Workload";

describe("Test workload Class", () => {
  let workload: Workload;
  beforeAll(() => {
    const services = [
      new Service("A", 3, 3, 3, [], []),
      new Service("B", 3, 3, 3, [], []),
    ];
    workload = new Workload("testworkload", services, 5);
  });
  it("getTotalMemory works as expected", () => {
    expect(workload.getTotalMemory()).toEqual(6);
  });
  it("getTotalCPU works as expected", () => {
    expect(workload.getTotalCPU()).toEqual(6);
  });
  it("getNamesOfServices works as expected", () => {
    expect(workload.getNamesOfServices()).toEqual(["A", "B"]);
  });
});
