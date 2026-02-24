# @redhat/cluster-sizer

TypeScript library for Kubernetes cluster sizing calculations.

## What is this?

This library provides the core functionality for sizing OpenShift/Kubernetes clusters based on workload requirements. It handles:

- Workload scheduling across nodes and zones
- Hardware capacity calculations
- Control plane node management
- Over-commitment ratio calculations
- Multi-zone high availability

## Usage

This library is designed to be used either:

1. **Directly** - Import into your Node.js/TypeScript application
2. **Via HTTP Service** - See [../service/README.md](../service/README.md) for the REST API wrapper

## Installation

### As part of the monorepo workspace:

```bash
cd /path/to/sizer
npm install --legacy-peer-deps
npm run build:lib
```

### As a standalone dependency:

```bash
npm install /path/to/sizer/lib
```

## Basic Example

```typescript
import { ClusterSizer, Platform } from '@redhat/cluster-sizer';

const sizer = new ClusterSizer();

const workloads = [
  {
    name: 'my-workload',
    count: 1,
    usesMachines: ['worker'],
    services: [
      {
        name: 'app-service',
        requiredCPU: 100,
        requiredMemory: 200,
        zones: 3
      }
    ]
  }
];

const result = sizer.size(workloads, Platform.AWS);

console.log(`Nodes required: ${result.nodeCount}`);
console.log(`Total CPU: ${result.totalCPU}`);
console.log(`Total Memory: ${result.totalMemory} GB`);
```

## Development

```bash
# Build
npm run build

# Run tests
npm test

# Clean
npm run clean
```

## Documentation

For complete documentation including:
- API reference
- HTTP service usage
- Test examples
- Integration guides
- Deployment instructions

See [../service/README.md](../service/README.md)

## License

MIT


