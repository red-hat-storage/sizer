import { getReadableMemory } from "../../src/utils/units";

describe("getReadableMemory", () => {
  it("should return '0.00 GB' for 0", () => {
    expect(getReadableMemory(0)).toBe("0.00 GB");
  });

  it("should return '1.00 GB' for 1", () => {
    expect(getReadableMemory(1)).toBe("1.00 GB");
  });

  it("should return '512.00 GB' for 512", () => {
    expect(getReadableMemory(512)).toBe("512.00 GB");
  });

  it("should return '1.00 TB' for 1024", () => {
    expect(getReadableMemory(1024)).toBe("1.00 TB");
  });

  it("should return '2.00 TB' for 2048", () => {
    expect(getReadableMemory(2048)).toBe("2.00 TB");
  });

  it("should return '1.50 TB' for 1536", () => {
    expect(getReadableMemory(1536)).toBe("1.50 TB");
  });
});
