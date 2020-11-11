import {
  Box,
  ColorModeProvider,
  CSSReset,
  Divider,
  Heading,
  Select,
  theme,
  ThemeProvider,
  Text
} from "@chakra-ui/core";
import React from "react";
import { render } from "react-dom";
import { MyInput, MyOutput, MySlider } from "./components";
import { getNextFitSizing, useSizingInfo } from "./sizing";

const App = () => {
  const sizingInfo = useSizingInfo();
  // simple form state
  const [nodes, setNodes] = React.useState(15);
  const [cpusPerNode, setCpusPerNode] = React.useState(8);
  const [totalReservedCpus, setTotalReservedCpus] = React.useState(8);
  // optimized form state
  const [envName, setEnvName] = React.useState(sizingInfo.envNames[0]);
  const [deviceVendorName, setDeviceVendorName] = React.useState(
    sizingInfo.envs[envName].vendorNames[0]
  );
  const [
    usableCapacityRequiredTB,
    setUsableCapacityRequiredTB
  ] = React.useState(100);

  if (!sizingInfo.envs[envName].vendorNames.includes(deviceVendorName)) {
    setDeviceVendorName(sizingInfo.envs[envName].vendorNames[0]);
  }

  ///////////////
  // Calculate //
  ///////////////

  const OCS = {
    base: {
      cpu: 30,
      mem: 120
    },
    osd: {
      cpu: 2,
      mem: 8
    },
    extra: {
      cpu: 3,
      mem: 0
    }
  };

  const maxStorageDeviceQuantity =
    (nodes * cpusPerNode - totalReservedCpus - OCS.base.cpu) / OCS.osd.cpu +
    OCS.extra.cpu;

  const coresRequiredByOCS =
    nodes * cpusPerNode - totalReservedCpus + OCS.extra.cpu;

  const quantityOfCorePairSubscriptions = Math.ceil(coresRequiredByOCS / 4);

  const sizing = getNextFitSizing(
    envName,
    deviceVendorName,
    usableCapacityRequiredTB
  );
  const nextFitCapacityTB = sizing["Usable (TB)"];
  const quantityOfInfraNodes = Number(sizing["Node Qty"]);
  const infraNodeSizing = sizing["Machine Type"];
  const totalStorageDeviceCount = Number(sizing["Devices Per Cluster"]);
  const storageDeviceDescription = sizing.Device;
  const quantityOfCorePairSubscriptionsOptimized = Math.ceil(
    (Number(sizing["Actual Node CPU"]) * quantityOfInfraNodes) / 4
  );

  ////////////
  // Render //
  ////////////

  const simpleForm = (
    <Box>
      <MyInput label="Number of worker nodes">
        <MySlider value={nodes} setValue={setNodes} />
      </MyInput>
      <MyInput label="Number of CPU's per node">
        <MySlider value={cpusPerNode} setValue={setCpusPerNode} />
      </MyInput>
      <MyInput label="Total number of CPU's to reserve for applications">
        <MySlider value={totalReservedCpus} setValue={setTotalReservedCpus} />
      </MyInput>
      <Box m={8} />
      <MyOutput label="Max storage device quantity">
        {maxStorageDeviceQuantity}
      </MyOutput>
      <MyOutput label="Cores required by OCS">{coresRequiredByOCS}</MyOutput>
      <MyOutput label="Quantity of core pair subscriptions">
        {quantityOfCorePairSubscriptions}
      </MyOutput>
    </Box>
  );

  const optimizedForm = (
    <Box>
      <MyInput label="Environment Type">
        <Select
          value={envName}
          onChange={(e) => setEnvName(e.currentTarget.value)}
        >
          {sizingInfo.envNames.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </Select>
      </MyInput>
      <MyInput label="Storage Devices Type">
        <Select
          value={deviceVendorName}
          onChange={(e) => setDeviceVendorName(e.currentTarget.value)}
        >
          {sizingInfo.envs[envName].vendorNames.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </Select>
      </MyInput>
      <MyInput label="Usable capacity required (TB)">
        <MySlider
          value={usableCapacityRequiredTB}
          setValue={setUsableCapacityRequiredTB}
          max={500}
        />
      </MyInput>
      <Box m={8} />
      <MyOutput label="Next fit capacity (TB)">{nextFitCapacityTB}</MyOutput>
      <Box m={4} />
      <MyOutput label="Quantity of infra nodes">
        {quantityOfInfraNodes}
      </MyOutput>
      <MyOutput label="Infra node sizing">{infraNodeSizing}</MyOutput>
      <Box m={4} />
      <MyOutput label="Total storage device count">
        {totalStorageDeviceCount}
      </MyOutput>
      <MyOutput label="Storage device description">
        {storageDeviceDescription}
      </MyOutput>
      <Box m={4} />
      <MyOutput label="Quantity of core pair subscriptions">
        {quantityOfCorePairSubscriptionsOptimized}
      </MyOutput>
    </Box>
  );

  return (
    <Box mx="auto" p={4} my={4} maxW="800px" minW="200px" style={{ backgroundColor: '#AAAAAA', color: "#000000"
    }}>

      <Heading><img src="http://rht-sbu.s3.amazonaws.com/images/ocs_logo.png" width="424px" height="140px" /></Heading>
      <Divider my={8} />

      <Heading>Sizing Solver</Heading>
      <Divider my={8} />

      <Heading my={8} textDecoration="underline" size="md">
        Simple Sizing
      </Heading>

Simple Sizing should be used when OpenShift Container Storage will run co-resident with applications on OpenShift worker nodes.

      <Box m={8}>{simpleForm}</Box>
      <Divider my={8} />

      <Heading my={8} textDecoration="underline" size="md">
        Optimized sizing
      </Heading>

Optimized Sizing should be used when OpenShift Container Storage will run on dedicated OpenShift infrastructure nodes. These nodes can be sized to best fit OpenShift Container Storage resource requirements, and only require OCS subscriptions (instead of OCS and OCP subscriptions).

      <Box m={8}>{optimizedForm}</Box>
      <Divider my={8} />
    </Box>
  );
};

render(
  <ThemeProvider theme={theme}>
    <ColorModeProvider value="light">
      <CSSReset />
      <App />
    </ColorModeProvider>
  </ThemeProvider>,
  document.getElementById("root")
);
