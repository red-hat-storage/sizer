class Disk {
  capacity: number;
  iops = 0;
  constructor(capacity: number) {
    this.capacity = capacity;
  }
}

export default Disk;
