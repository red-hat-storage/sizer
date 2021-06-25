import {
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import * as React from "react";

type CreateCard = {
  type: string;
  onClick: () => void;
  Icon: React.ComponentType;
  className?: string;
};

const CreateCard: React.FC<CreateCard> = ({
  type,
  onClick,
  Icon,
  className,
}) => {
  return (
    <Card className={className}>
      <CardBody>
        <EmptyState>
          <EmptyStateIcon icon={Icon} />
          <Title headingLevel="h4" size="lg">
            Create a new {type}
          </Title>
          <Button variant="primary" onClick={onClick}>
            Create {type}
          </Button>
        </EmptyState>
      </CardBody>
    </Card>
  );
};

export default CreateCard;
