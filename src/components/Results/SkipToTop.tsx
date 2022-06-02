import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
} from "@patternfly/react-core";
import * as React from "react";

type SkipToToTopProps = {
  onClick: () => void;
};

const SkipToTop: React.FC<SkipToToTopProps> = ({ onClick }) => {
  const [isVisible, setVisible] = React.useState(true);
  return isVisible ? (
    <Alert
      className="skip-to-top"
      variant="info"
      title="You scrolled down"
      actionClose={<AlertActionCloseButton onClose={() => setVisible(false)} />}
      actionLinks={
        <AlertActionLink onClick={onClick}>Scroll to Top </AlertActionLink>
      }
    />
  ) : null;
};

export default SkipToTop;
