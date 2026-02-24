# Sizer HTTP Service

HTTP API wrapper for the [@redhat/cluster-sizer](../lib) library.

## Overview

This service provides a REST API for cluster sizing calculations. It is designed to be deployed alongside the Migration Planner to help size OpenShift clusters based on VM inventory.

## API Endpoints

### Health Check

```bash
GET /health
```

Response:

```json
{ "status": "ok", "service": "sizer-library", "version": "1.0.0" }
```

### Custom Workload Sizing

```bash
POST /api/v1/size/custom
```

Request:

```json
{
  "platform": "AWS|Azure|GCP|BareMetal",
  "machineSets": [
    // Optional - defaults provided for each platform
    {
      "name": "default",
      "cpu": 32,
      "memory": 128,
      "instanceName": "bare-metal-worker",
      "numberOfDisks": 24,
      "onlyFor": [],
      "label": "Worker Node"
    }
  ],
  "workloads": [
    {
      "name": "vm-workload",
      "count": 1,
      "usesMachines": ["default"],
      "services": [
        {
          "name": "vms",
          "requiredCPU": 100,
          "requiredMemory": 200,
          "limitCPU": 100, // Optional: for over-commitment
          "limitMemory": 200, // Optional: for over-commitment
          "zones": 3, // 1 or 3 for HA
          "runsWith": [],
          "avoid": []
        }
      ]
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "nodeCount": 10,
    "zones": 3,
    "totalCPU": 160,
    "totalMemory": 640,
    "resourceConsumption": {
      "cpu": 150,
      "memory": 500,
      "limits": {
        "cpu": 300,
        "memory": 1000
      },
      "overCommitRatio": {
        "cpu": 2.0,
        "memory": 2.0
      }
    },
    "advanced": [
      /* per-zone, per-node details */
    ]
  }
}
```

## Local Development

### Using NPM Workspaces (Recommended)

From the repository root:

```bash
# Install all workspace dependencies (root, lib, service)
npm install --legacy-peer-deps

# Build library and service
npm run build:lib
npm run build:service

# Or build both
npm run build:all

# Start service (from root)
cd service && PORT=9200 npm start
```

### Standalone Development

From the service directory:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build
npm run build

# Run production
PORT=9200 npm start
```

Service runs on port 9200 by default.

## Library Development

### Run Library Tests

The core library includes comprehensive unit tests:

```bash
# From repository root
cd lib
npm test

# Or using workspace command
npm test --workspace=lib
```

Tests cover:

- Cluster sizing calculations
- Workload scheduling
- Machine set validation
- Zone distribution
- Over-commitment calculations
- Control plane strategies

## Test Examples

See [test-examples/](./test-examples/) directory for example payloads demonstrating:

- Different over-commitment profiles (1:1, 1:2, 1:4, 1:6)
- Multi-zone deployments
- Control plane scheduling strategies

Run tests:

```bash
cd test-examples
./run-tests.sh
```

## Docker Build

### Build Optimized Image

From the repository root:

```bash
docker build -t quay.io/<your-username>/cluster-sizer-service:1.0.0 -f service/Dockerfile .
```

**Image size:** ~131 MB (optimized with production dependencies only)

### Push to Registry

```bash
docker login quay.io
docker push quay.io/<your-username>/cluster-sizer-service:1.0.0
```

### Run Locally

```bash
docker run -d -p 9200:9200 quay.io/<your-username>/cluster-sizer-service:1.0.0

# Test
curl http://localhost:9200/health
```

## Kubernetes/OpenShift Deployment

The service can be deployed to Kubernetes/OpenShift. The specific deployment configuration should be maintained in the consuming application's repository.

### Deployment Requirements

- **Container Image:** Build and push to your container registry
- **Port:** 9200
- **Environment Variable:** `PORT=9200`
- **Health Check Endpoint:** `GET /health`
- **Liveness/Readiness Probes:** Both use `/health` endpoint

### Example Deployment

Here's a minimal example to get started. Customize this for your specific environment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sizer-service
  namespace: your-namespace
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sizer-service
  template:
    metadata:
      labels:
        app: sizer-service
    spec:
      containers:
        - name: sizer
          image: your-registry/cluster-sizer-service:1.0.0
          ports:
            - containerPort: 9200
          env:
            - name: PORT
              value: "9200"
          livenessProbe:
            httpGet:
              path: /health
              port: 9200
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 9200
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: sizer-service
  namespace: your-namespace
spec:
  selector:
    app: sizer-service
  ports:
    - protocol: TCP
      port: 9200
      targetPort: 9200
```

### Internal Service Access

Once deployed, the service will be available internally at:

```
http://sizer-service.<your-namespace>.svc.cluster.local:9200
```

### Testing via Port Forward

For local testing or external access:

```bash
kubectl port-forward -n <your-namespace> svc/sizer-service 9200:9200

# Test
curl http://localhost:9200/health
```

## Environment Variables

- `PORT` - Server port (default: 9200)

## Architecture

This service is part of a monorepo with NPM workspaces:

- **lib/** - Core cluster-sizer TypeScript library
- **service/** - HTTP wrapper (this package)
- **server/** - Original sizer web UI server

The Docker build is optimized to include only production dependencies, keeping the image size minimal (~131 MB).
