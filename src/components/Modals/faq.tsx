import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Modal,
} from "@patternfly/react-core";

type FAQModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

const FAQModal: React.FC<FAQModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const [visibleItem, setVisibleItem] = React.useState("");
  return (
    <Modal
      title="Advanced Results"
      isOpen={isOpen}
      onClose={onClose}
      id="advanced-results-modal"
    >
      <Accordion asDefinitionList>
        <AccordionItem>
          <AccordionToggle
            onClick={() => setVisibleItem((item) => (item === "1" ? "" : "1"))}
            isExpanded={visibleItem === "1"}
            id="1"
          >
            Bare metal and VM sizes only go up to 128GB RAM and 48 CPU Units,
            but I have more! Why can't I chose more?
          </AccordionToggle>
          <AccordionContent id="1-expanded" isHidden={visibleItem !== "1"}>
            We said that the maximum amount should be 20 OSDs per instance -
            that would correspond to ~40 CPU Units and ~100GB RAM (for a
            OSD-only node) - this is the reason why 128GB RAM is the highest
            choice. If the node is larger, there would be no change in the
            solver calculation.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionToggle
            onClick={() => setVisibleItem((item) => (item === "2" ? "" : "2"))}
            isExpanded={visibleItem === "2"}
            id="2"
          >
            I see that NooBaa Pods and MGR Pods are allocated twice in the
            solver, but they only get deployed once in my cluster - why is that?
          </AccordionToggle>
          <AccordionContent id="2-expanded" isHidden={visibleItem !== "2"}>
            That is intentional, because we want to allocate enough resources to
            allow for failover. Thus we allocate additional resources for
            everything that is not fault-tolerant by itself (like the RGW or
            MONs) even though that will not be consumed immediately. We do that
            to ensure the cluster is properly sized.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionToggle
            onClick={() => setVisibleItem((item) => (item === "3" ? "" : "3"))}
            isExpanded={visibleItem === "3"}
            id="3"
          >
            The base Virtual instances for a VMware architecture are 48 CPUs and
            128 GB RAM, but the CPU and RAM units specified are far lower.
          </AccordionToggle>
          <AccordionContent id="3-expanded" isHidden={visibleItem !== "3"}>
            What you see is the difference between the node's available
            resources versus the resources that are consumed by ODF services. If
            these two differ, you know that there is room to put additional
            non-ODF workloads on these nodes if you decide not to run infra
            nodes.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionToggle
            onClick={() => setVisibleItem((item) => (item === "4" ? "" : "4"))}
            isExpanded={visibleItem === "4"}
            id="4"
          >
            OSDs are not balanced between nodes
          </AccordionToggle>
          <AccordionContent id="4-expanded" isHidden={visibleItem !== "4"}>
            This was a deliberate decision. Especially for bare metal
            deployments, customers would want to fill up nodes, before they add
            new ones. If not all nodes are full, they would want to have
            homogenous deployments and one "spillover" node, which they could
            easily fill up later on (instead of going to every single server and
            adding a disk)
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionToggle
            onClick={() => setVisibleItem((item) => (item === "5" ? "" : "5"))}
            isExpanded={visibleItem === "5"}
            id="5"
          >
            If I deploy a 3-node ODF cluster on workers, how much resources are
            needed for OCP base services?
          </AccordionToggle>
          <AccordionContent id="5-expanded" isHidden={visibleItem !== "5"}>
            This ODF solver does not add OCP base services by default, because
            we do not know that overall OCP cluster size. Under normal
            circumstances you will need an additional 0.5 CPU Units and 1GB RAM
            for OCP base services.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Modal>
  );
};

export default FAQModal;
