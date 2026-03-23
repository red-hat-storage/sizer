# Development Guide

## Getting Started

### Prerequisites

- Node.js and npm ([installation guide](https://nodejs.org/en/download/))
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/red-hat-storage/sizer.git
cd ocs-sizer

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start on http://localhost:9005 with hot reload enabled.

## Key Architecture

### State Management

The application uses **Redux Toolkit** for centralized state management:

- **Store**: `src/redux/store.ts` - Root Redux store configuration
- **Reducers**: `src/redux/reducers/` - State slices for different domains:
  - `cluster.ts` - Overall cluster configuration
  - `machineSet.ts` - Machine set (compute pool) management
  - `node.ts` - Individual node state tracking
  - `zone.ts` - Availability zone management
  - `workload.ts` - User-defined workload definitions
  - `service.ts` - Service-level resource requirements
  - `ocs.ts` - ODF/OCS storage configuration
  - `ui.ts` - UI state (tabs, modals, tour)

### Workload Scheduler

The core sizing logic lives in `src/scheduler/workloadScheduler.ts`. This is the most critical component:

**What it does:**

1. Calculates minimum zone requirements for high availability
2. Handles workload affinity (workloads that must run on specific machine sets)
3. Schedules co-located services (services that share nodes)
4. Places replicated services across zones for fault tolerance
5. Automatically provisions additional zones/nodes when capacity is insufficient

**How it works:**

- Takes workloads and breaks them into individual services
- Each service has CPU, memory, and replica requirements
- Services are placed on nodes based on available capacity
- Respects node taints, tolerations, and affinity rules
- Accounts for kubelet overhead and system reservations

### Cloud Platform Integration

**Instance Definitions:**

- `AWS.json`, `GCP.json`, `AZURE.json`, `IBM-classic.json`, `IBM-vpc.json` - Cloud instance type definitions
- `src/cloudInstance.ts` - Platform abstraction layer with default instance selections

Each platform has configured defaults for:

- OCP worker nodes (general compute)
- ODF storage nodes (storage-optimized)
- Control plane nodes

### Component Structure

**Main Application:**

- `src/index.tsx` - Application entry point
- `src/components/sizer.tsx` - Root component with React Router setup

**Pages** (lazy-loaded for performance):

- `Compute/ComputePage.tsx` - Create and configure machine sets
- `Workload/workloads.tsx` - Define workloads and services
- `Storage/StoragePage.tsx` - Configure ODF storage parameters
- `Results/ResultsPage.tsx` - Display sizing results and recommendations

**UI Components:**

- `Header/` - Application header with navigation
- `Modals/` - FAQ, About, Advanced Results modals
- `Common/` - Shared UI components (Icon, PlatformSelector)
- `Generic/` - Reusable card components
- `Tour/` - Shepherd.js-based guided tour

### Key Files and Their Purposes

| File                        | Purpose                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `src/api.ts`                | API integration setup and GitHub data fetching             |
| `src/cloudInstance.ts`      | Cloud instance type management and platform defaults       |
| `src/utils/node.ts`         | Node capacity calculations, zone scoring, kubelet overhead |
| `src/utils/service.ts`      | Service placement logic and co-location handling           |
| `src/utils/workload.ts`     | Workload validation and transformation utilities           |
| `src/utils/controlPlane.ts` | Control plane node scheduling and taint management         |
| `src/utils/kubelet.ts`      | Kubelet resource reservation calculations                  |
| `src/constants.ts`          | Application-wide constants                                 |
| `webpack.config.ts`         | Webpack build configuration                                |
| `jest.config.ts`            | Jest testing configuration                                 |

### Type System

All TypeScript types are defined in `src/types/`:

- `MachineSet.ts` - Machine set configuration interface
- `Node.ts` - Node resource specifications
- `Workload.ts` - Workload and service definitions
- `Zone.ts` - Availability zone interface
- `Service.ts` - Service resource requirements
- `odf.ts` - ODF-specific types (DeploymentType, etc.)
- `common.ts` - Shared types (Platform enum, etc.)

## Data Flow

1. **Platform Selection** → Sets default instance types from cloud JSON files
2. **Machine Set Creation** → User defines compute pools (worker, storage, etc.)
3. **Workload Definition** → User creates workloads with service specifications
4. **Scheduler Execution** → Workload scheduler allocates services to nodes
5. **Results Display** → Shows required node counts, capacity, alerts, and recommendations

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest __tests__/redux/node.spec.ts

# Run with coverage
npm test -- --coverage
```

### Linting and Formatting

```bash
# Lint TypeScript files
npm run lint

# Format code
npm run format
```

### Building

```bash
# Production build (upstream)
npm run build-upstream

# Beta build
npm run betabuild-upstream

# Lab deployment build
npm run build
```

### Pre-commit Hooks

The project uses Husky to run pre-commit hooks:

- **lint-staged** - ESLint on staged `.ts` files
- **pretty-quick** - Prettier formatting on staged files

## Important Patterns

### Adding a New Machine Set

1. User creates machine set in `ComputePage`
2. Dispatches `addMachineSet` action
3. Reducer updates `machineSet` slice
4. Scheduler recalculates node allocations
5. Results page reflects changes

### Adding a New Workload

1. User defines workload in `workloads.tsx`
2. Workload contains multiple services
3. Each service specifies CPU, memory, replicas
4. Services can be co-located (share nodes) or independent
5. Scheduler places services on appropriate nodes

### Control Plane Scheduling

Control plane nodes can be marked as schedulable. When enabled:

- Control plane nodes can host user workloads
- Taints are removed or tolerations are added
- Workload scheduler considers control plane capacity
- See `src/utils/controlPlane.ts` for implementation

## Troubleshooting

### Development Server Issues

- Ensure port 9005 is not in use
- Clear `build/` directory: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Build Failures

- Check TypeScript errors: `npx tsc --noEmit`
- Verify webpack config: `ts-node webpack.config.ts`

### Test Failures

- Clear Jest cache: `npx jest --clearCache`
- Run specific test: `npx jest <test-file>`

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [PatternFly React Components](https://www.patternfly.org/v4/get-started/develop)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
