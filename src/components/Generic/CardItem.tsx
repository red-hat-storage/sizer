import * as React from "react";
import {
  Card as PfCard,
  CardActions,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Title,
} from "@patternfly/react-core";
import { CloseIcon, EditIcon } from "@patternfly/react-icons";
import "./card.css";

type CardItemProps = {
  title: string;
  value: React.ReactText;
};

type CardProps = {
  children: React.ReactNode;
  cardType: string;
  itemName: string;
  itemId?: number;
  remove: () => any;
  disableActions?: boolean;
  edit?: () => void;
};

export const CardItem: React.FC<CardItemProps> = ({ title, value }) => (
  <Flex direction={{ default: "column" }}>
    <FlexItem>
      <Title headingLevel="h3" size="lg">
        {title}
      </Title>
    </FlexItem>
    <FlexItem>{value}</FlexItem>
  </Flex>
);

export const Card: React.FC<CardProps> = ({
  itemName,
  cardType,
  disableActions = false,
  remove,
  edit,
  children,
}) => {
  return (
    <PfCard className="generic-card">
      <CardHeader className="generic-card__header">
        <Title headingLevel="h2" size="xl">
          {itemName} {cardType}
        </Title>
        <CardActions>
          {!disableActions && edit && <EditIcon onClick={edit} />}
          {!disableActions && <CloseIcon onClick={remove} />}
        </CardActions>
      </CardHeader>
      <CardBody className="generic-card__body">
        <Flex direction={{ default: "column" }}>
          {React.Children.map(children, (child) => (
            <FlexItem>{child}</FlexItem>
          ))}
        </Flex>
      </CardBody>
    </PfCard>
  );
};
