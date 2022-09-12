export const getReadableMemory = (value: number): string => {
  const units = ["MB", "GB", "TB"];

  let unitIndex = 0;
  let scaledValue = value;

  while (scaledValue >= 1024 && unitIndex < units.length - 1) {
    unitIndex += 1;
    scaledValue /= 1024;
  }

  return `${scaledValue.toFixed(2)} ${units[unitIndex]}`;
};
