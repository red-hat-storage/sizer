# Introduction

This is a simple webserver that runs the React application as a backend.

# Steps to run

- Run `npm run build-upstream` in the parent directory. This should result in a file named build to be created.
- Run `npm run dev` inside of server package to instantiate the webserver.
- To create the Container image of the server run `docker build -f Dockerfile.server ./`

# Interacting with the server

Essentially you perform `GET` calls to the application to perform actions.

## Adding MachineSet

The following parameters are supported as part of the `/addMachine` endpoint.

| Parameter           | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| msName              | The name you want to assign to the machineSet                            |
| instance (optional) | instance name of the machine to use (Only applicable for Cloud)          |
| cpu (optional)      | The amount of CPU present in the machine (Only for baremetal)            |
| mem (optional)      | The amount of Memory present in the machine (Only for baremetal)         |
| platform            | Platform to be used(AWS, GCP, AZURE, IBMC, IBMV, VMware, BareMetal, RHV) |

In the following cURL command you can see how to create a MachineSet named `odf-dedicted` for `AWS` platform using the `m6a.24xlarge` instance.

```
curl --location --request GET 'localhost:9100/addMachine?msName=odf-dedicated&instance=m6a.24xlarge&platform=AWS'
```

## Creating a ODF StorageCluster

The following parameters are supported as part of the `/` endpoint.

| Parameter         | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| usableCapacity    | The total size of the ODF cluster                                        |
| diskSize          | Size of each individual disk                                             |
| msName (optional) | The name of the machineSet to be used by the cluster                     |
| platform          | Platform to be used(AWS, GCP, AZURE, IBMC, IBMV, VMware, BareMetal, RHV) |

The layout of the OCP cluster is returned as response.
