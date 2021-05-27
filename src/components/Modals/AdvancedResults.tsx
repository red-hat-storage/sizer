import * as React from "react";
import { Modal, Title } from "@patternfly/react-core";
import { DeploymentDetails } from "../../types";
import { ReplicaSetResults } from "../Results/ReplicaSetResults";
import "./advanced-results.css";

type AdvancedResultsModalProps = {
  onClose: () => void;
  isOpen: boolean;
  replicaSets: DeploymentDetails["replicaSets"];
};

const AdvancedResultsModal: React.FC<AdvancedResultsModalProps> = ({
  onClose,
  isOpen,
  replicaSets,
}) => {
  React.useEffect(() => {
    const modal = document.getElementById("advanced-results-modal");
    const cb = (event: any) => {
      const currentlySelected = event?.originalTarget;
      if (isOpen && !modal?.contains(currentlySelected)) onClose();
    };
    document?.addEventListener("click", cb);
    return () => {
      document?.removeEventListener("click", cb);
    };
  });

  return (
    <Modal
      title="Advanced Results"
      isOpen={isOpen}
      onClose={onClose}
      id="advanced-results-modal"
      className="advanced-modal"
    >
      <div className="advanced-results left-margined">
        {replicaSets?.map((replSet, i) => (
          <div className="advanced-results__item left-margined" key={i}>
            <div>
              <Title headingLevel="h4" size="xl">
                Node Set {(i + 1).toFixed(0)}
              </Title>
            </div>
            <ReplicaSetResults nodes={replSet.nodes} />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AdvancedResultsModal;
