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
  itemId?: string;
  remove: (name: string) => () => void;
  disableDeletion?: boolean;
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
  itemId,
  cardType,
  disableDeletion = false,
  remove,
  edit,
  children,
}) => {
  const onClick = React.useMemo(() => remove(itemId ? itemId : itemName), [
    itemName,
    remove,
    itemId,
  ]);

  return (
    <PfCard className="generic-card">
      <CardHeader className="generic-card__header">
        <Title headingLevel="h2" size="xl">
          {itemName} {cardType}
        </Title>
        <CardActions>
          {edit && <EditIcon onClick={edit} />}
          {!disableDeletion && <CloseIcon onClick={onClick} />}
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
