import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Alert,
  AlertActionLink,
} from "@patternfly/react-core";
import { State } from "../../types";
import { SupportExceptionObject, getSupportExceptions } from "./utils";
import "./exception.css";

type ExceptionAlertProps = {
  state: State;
};

type ExceptionReportProps = {
  exceptions: SupportExceptionObject[];
  className?: string;
  toggleClassName?: string;
};

export const ExceptionReport: React.FC<ExceptionReportProps> = ({
  exceptions,
  className,
  toggleClassName,
}) => {
  const [expanded, setExpanded] = React.useState(new Set<string>());
  const onToggle = (id: string) =>
    setExpanded((curr) => {
      curr.has(id) ? curr.delete(id) : curr.add(id);
      return new Set([...curr]);
    });
  if (!exceptions || exceptions?.length === 0) return null;
  return (
    <Accordion asDefinitionList={false}>
      {exceptions.map((item) => (
        <AccordionItem key={item.issue}>
          <AccordionToggle
            onClick={() => onToggle(item.issue)}
            isExpanded={expanded.has(item.issue)}
            id={item.issue}
            className={toggleClassName}
          >
            {item.header}
          </AccordionToggle>
          <AccordionContent
            id={`${item.issue}-content`}
            isHidden={!expanded.has(item.issue)}
            className={className}
          >
            {item.message}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const ExceptionAlert: React.FC<ExceptionAlertProps> = ({ state }) => {
  const [isOpen, setOpen] = React.useState(false);

  const exceptions = React.useMemo(() => getSupportExceptions(state), [
    JSON.stringify(state),
  ]);

  React.useEffect(() => {
    if (exceptions.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [exceptions]);

  return isOpen ? (
    <Alert
      isInline
      variant="warning"
      title="Support Exception"
      actionLinks={
        <AlertActionLink
          onClick={() =>
            window.open("https://access.redhat.com/articles/5001441", "_blank")
          }
        >
          Check Support Matrix
        </AlertActionLink>
      }
    >
      <div>
        <div>
          <ExceptionReport
            exceptions={exceptions}
            toggleClassName="exception-alert__toggle"
            className="exception-alert__body"
          />
        </div>
        <div>
          This cluster is not within the regular support limits. You will need a
          support exception!
        </div>
      </div>
    </Alert>
  ) : null;
};

export default ExceptionAlert;
