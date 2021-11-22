import * as React from "react";
import { Modal, Title } from "@patternfly/react-core";
import { ReplicaSetResults } from "../Results/ReplicaSetResults";
import { useCloseModal } from "../../hooks/modal";
import { Zone_ as Zone } from "../../models/Zone";
import "./advanced-results.css";

type AdvancedResultsModalProps = {
  onClose: () => void;
  isOpen: boolean;
  zones: Zone[];
};

const AdvancedResultsModal: React.FC<AdvancedResultsModalProps> = ({
  onClose,
  isOpen,
  zones,
}) => {
  useCloseModal(onClose, isOpen);
  return (
    <Modal
      title="Advanced Results"
      isOpen={isOpen}
      onClose={onClose}
      className="advanced-modal"
    >
      <div className="advanced-results left-margined">
        {zones?.map((zone, i) => (
          <div className="advanced-results__item left-margined" key={i}>
            <div>
              <Title headingLevel="h4" size="xl">
                Zone {(i + 1).toFixed(0)}
              </Title>
            </div>
            <ReplicaSetResults nodes={zone.nodes} />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AdvancedResultsModal;
