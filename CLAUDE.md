# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ODF Sizer is a web application and library for sizing OpenShift/Kubernetes clusters. It estimates hardware requirements (nodes, CPU, memory) for ODF (OpenShift Data Foundation) deployments based on workload specifications and cloud platform constraints.

## Repository Structure

This is an NPM workspaces monorepo with three packages:

- **Root (`/`)** - React 18 SPA with Redux Toolkit, PatternFly UI, Webpack 5 bundler
- **`lib/`** (`@redhat/cluster-sizer`) - Pure TypeScript cluster sizing library with no UI dependencies. Contains the core scheduling algorithms.
- **`service/`** (`sizer-service`) - Express.js REST API wrapper around the lib package (port 9200)
- **`server/`** - Legacy Express server that serves the React build as static files

## Build & Development Commands

```bash
# Install (legacy peer deps required)
npm install --legacy-peer-deps

# Dev server (http://localhost:9005, hot reload)
npm run dev

# Production builds
npm run build-upstream          # standard production build
npm run build                   # lab mode build (PUBLIC_PATH=/labs/ocsst/)

# Build workspaces
npm run build:lib               # build lib only (tsc)
npm run build:service           # build service only (tsc)
npm run build:all               # build all workspaces

# Test & lint
npm test                        # Jest unit tests (runs __tests__/redux/ only)
npm run lint                    # ESLint on src/
npm run format                  # Prettier on src/

# E2E tests (requires running dev server for local)
npm run cy:run:local            # Cypress against localhost:9005
npm run cy:run:prod             # Cypress against production
```

The lib package has its own test suite: `cd lib && npm test`

## Architecture

### Sizing Pipeline

The core algorithm lives in `lib/src/core/ClusterSizer.ts`. The static `ClusterSizer.size()` method takes workload descriptors, a platform, and optional machine sets, then returns a `ClusterSizing` result with node counts, zones, CPU/memory totals, and detailed placement.

The pipeline:

1. Convert `WorkloadDescriptor[]` into internal `Workload` + `Service` objects (`lib/src/utils/workload.ts`)
2. Validate all workloads can fit on available machine sets (kubelet overhead included)
3. Schedule each workload via `workloadScheduler()` (`lib/src/scheduler/workloadScheduler.ts`)
4. The scheduler handles zone requirements, service affinity (`runsWith`), anti-affinity (`avoid`), and machine set affinity (`usesMachines`)

### Frontend State Management

Redux store (`src/redux/store.ts`) has 8 slices: `ui`, `ocs`, `workload`, `machineSet`, `cluster`, `node`, `zone`, `service`. The UI dispatches actions, then calls the lib's scheduling via `src/api.ts` which exposes functions like `createODFWorkload()`, `schedule()`, `createMachineSet()`, `changePlatform()` on the `window` object.

### Platform Instance Data

Cloud instance definitions (AWS, Azure, GCP, IBM) are stored as JSON arrays in `lib/src/data/`. Each entry defines CPU, memory, storage, and flags like `default`, `controlPlane`, `odfDefault`. Root-level JSON files (e.g., `AWS.json`) are duplicates included via tsconfig for TypeScript reference.

### Key Types (defined in `lib/src/types/`)

- `Platform` enum: AWS, GCP, AZURE, VMware, RHV, BAREMETAL, IBMC, IBMV
- `MachineSet`: node template with cpu, memory, disks, `onlyFor` workload restrictions, labels
- `WorkloadDescriptor`: user-facing workload definition with services, count, machine affinity
- `Service`: pod spec with CPU/memory requests, zone count, affinity rules, over-commit settings
- `Node`: scheduled node with assigned service IDs and machine set reference
- `Zone`: availability zone containing node IDs

### ODF Deployment Types

`INTERNAL` (same cluster), `EXTERNAL` (separate cluster), `COMPACT` (fewer nodes), `MINIMAL` (minimum viable). Configured via the `ocs` Redux slice.

### Over-Commitment

Services support `overCommitMode`: `"static"` (fixed limits), `"dynamic"` (min/max range), or `"none"`. Over-commit ratios and risk levels (`none`/`low`/`medium`/`high`) are calculated in `lib/src/utils/overcommit.ts`.

### Kubelet Overhead

`lib/src/utils/kubelet.ts` reserves ~5% CPU (capped 500m) + ~4% memory (capped 500Mi) per node, with additional reserves on control plane nodes (+2 CPU, +4GB memory).

## CI/CD

GitLab CI (`.gitlab-ci.yml`): install, lint, test, webpack build, deploy to Google Cloud Storage. Production deploys from `main`, beta from `develop`.

## Pre-commit Hooks

Husky runs `lint-staged` (ESLint on .ts files) and `pretty-quick --staged` on commit.
