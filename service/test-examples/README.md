# Sizer API Test Examples

This directory contains test payloads and scripts for the Sizer HTTP API.

## Test Inventory Files

### 01-inventory-batches-small.json / 01-inventory-batches-small.yaml

**Large Inventory - Multiple Services (13 services)**

- **Source**: 281 VMs, 1094 CPU, 2425 GB
- **Worker Nodes**: 128 CPU / 512 GB
- **Services**: 13 services (84.2 CPU / 186.5 GB per service)
- **Over-commitment**: 1.5× (Balanced)
- **Expected Result**: 16 nodes (3 CP + 13 workers)
- **Use Case**: Demonstrates multiple service scheduling for large aggregated workload

### 02-inventory-small.json / 02-inventory-small.yaml

**Small Inventory - Schedulable Control Plane**

- **Source**: 50 VMs, 60 CPU, 120 GB
- **Worker Nodes**: 64 CPU / 256 GB
- **Control Plane**: Schedulable (64 CPU / 256 GB)
- **Services**: 1 service (fits on CP nodes)
- **Over-commitment**: 1.5× (Balanced)
- **Expected Result**: 3 nodes (schedulable CP)
- **Use Case**: Demonstrates co-location of VMs with control plane

### 02a-performance.json

**Performance Profile (1:1 - No Over-Commitment)**

- **Source**: Same as 02-inventory-small (50 VMs, 60 CPU, 120 GB)
- **Over-commitment**: 1:1 (Performance) - limits = requests
- **Expected Over-commit Ratio**: ~1.0 CPU, ~0.55 Memory
- **Expected Result**: 3 nodes (schedulable CP)
- **Use Case**: Maximum performance, no over-commitment

### 02b-balanced.json

**Balanced Profile (1:2 - Conservative Over-Commitment)**

- **Source**: Same as 02-inventory-small (50 VMs, 60 CPU, 120 GB)
- **Over-commitment**: 1:2 (Balanced) - limits = 2× requests
- **Expected Over-commit Ratio**: ~1.94 CPU, ~1.04 Memory
- **Expected Result**: 3 nodes (schedulable CP)
- **Use Case**: Most production workloads, good balance

### 02c-standard.json

**Standard Profile (1:4 - Standard Over-Commitment)**

- **Source**: Same as 02-inventory-small (50 VMs, 60 CPU, 120 GB)
- **Over-commitment**: 1:4 (Standard) - limits = 4× requests
- **Expected Over-commit Ratio**: ~3.82 CPU, ~2.02 Memory
- **Expected Result**: 3 nodes (schedulable CP)
- **Use Case**: Dev/test environments, bursty workloads

### 02d-high-density.json

**High Density Profile (1:6 - Maximum Over-Commitment)**

- **Source**: Same as 02-inventory-small (50 VMs, 60 CPU, 120 GB)
- **Over-commitment**: 1:6 (High Density) - limits = 6× requests
- **Expected Over-commit Ratio**: ~5.7 CPU, ~3.0 Memory
- **Expected Result**: 3 nodes (schedulable CP)
- **Use Case**: Maximum resource savings, highly bursty workloads

### 03-inventory-batches-large.json / 03-inventory-batches-large.yaml

**Real Production Inventory - UI-Compatible Large (72 services)**

- **Source**: 795 VMs, 4556 CPU, 25661 GB (real production data)
- **Worker Nodes**: 128 CPU / 512 GB (UI-compatible, memory-limited)
- **Services**: 72 services (memory is the bottleneck)
  - First 3 services: 12 VMs each (36 VMs)
  - Last 69 services: 11 VMs each (759 VMs)
- **Per Service**: 63.28 CPU / 356.4 GB
- **Over-commitment**: 1.5× (Balanced) - Results in 1.08× memory over-commit
- **Expected Result**: 75 nodes (3 CP + 72 workers)
- **Use Case**: Production-scale inventory with UI-compatible node sizing
- **Note**: UI limits memory to 512 GB max per node

## API Endpoints

### POST /api/v1/size/custom

Custom sizing with explicit workload definitions

**Request:**

```json
{
  "platform": "BareMetal",
  "detailed": true,
  "machineSets": [...],
  "workloads": [...]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "nodeCount": 54,
    "zones": 3,
    "totalCPU": 6576,
    "totalMemory": 156768,
    "resourceConsumption": {...},
    "advanced": [...]
  }
}
```

## Running Tests

1. Start the sizer service:

```bash
cd service
PORT=9200 node dist/server.js
```

2. Run individual tests:

```bash
# From repository root
curl -X POST http://localhost:9200/api/v1/size/custom \
  -H "Content-Type: application/json" \
  -d @service/test-examples/03-inventory-batches-large.json | jq '.'
```

## Notes

- All JSON files can be tested via the API
- YAML files are for UI import only (not API compatible)
- Test files use realistic hardware specs (HPE Synergy 480 Gen10 Plus)
- Over-commitment defaults to 1.5× (Balanced) unless otherwise specified
