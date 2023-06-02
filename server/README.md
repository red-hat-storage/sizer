# Introduction

This is a simple webserver that runs the React application as a backend.

# Steps to run

- Run `npm run build-upstream` in the parent directory. This should result in a file named build to be created.
- Run `npm run dev` inside of server package to instantiate the webserver.
- To create the Container image of the server run `docker build -f Dockerfile.server ./`

# Interacting with the server

Essentially you perform `POST` call to the `/` endpoint to create a StorageCluster and a Machineset. You can select the platform as well.

## Creating a ODF StorageCluster

The following parameters are supported as part of the `/` endpoint. Send a `POST` to the endpoint.

| Parameter           | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| usableCapacity      | The total size of the ODF cluster                                        |
| diskSize            | Size of each individual disk                                             |
| msName (optional)   | The name of the machineSet to be used by the cluster                     |
| platform            | Platform to be used(AWS, GCP, AZURE, IBMC, IBMV, VMware, BareMetal, RHV) |
| instance (optional) | instance name of the machine to use (Only applicable for Cloud)          |
| cpu (optional)      | The amount of CPU present in the machine (Only for baremetal)            |
| mem (optional)      | The amount of Memory present in the machine (Only for baremetal)         |

## Getting the cluster layout

Send a `GET` request to the `/` endpoint to get the layout of the OCP cluster.
