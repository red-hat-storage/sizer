import { Service } from "../src/models/Service";

const serviceName = "test-serivce";

describe("Test Service", () => {
  let service: Service;
  beforeAll(() => {
    service = new Service(serviceName, 2, 2, 3, [], []);
  });

  it("Returns details get correctly", () => {
    expect(service.getDetails()).toEqual(serviceName);
  });
});
