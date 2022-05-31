import {
  ClipboardCopy,
  ClipboardCopyVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import { BugIcon, SadCryIcon } from "@patternfly/react-icons";
import * as React from "react";
import { connect } from "react-redux";
import { Store } from "../redux";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: string;
};

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ state?: Store }>,
  ErrorBoundaryState
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: !!error,
      error: JSON.stringify(errorInfo.componentStack),
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <EmptyState>
            <EmptyStateIcon icon={BugIcon} />
            <Title headingLevel="h4" size="lg">
              Oops! Looks like you found a bug in our tool... <SadCryIcon />
            </Title>
            <EmptyStateBody>
              <div>
                Please contact the maintainers Chris Blum (cblum@redhat.com) or
                Bipul Adhikari (badhikar@redhat.com).
              </div>
              You can also create an issue in our{" "}
              <a
                href="https://gitlab.consulting.redhat.com/red-hat-data-services/ocs-sizer/-/issues"
                target="_blank"
              >
                repository
              </a>
              . If you choose to do so please attach the following information
              in the issue.
              <ClipboardCopy
                isReadOnly
                isExpanded
                hoverTip="Copy"
                clickTip="Copied"
                variant={ClipboardCopyVariant.expansion}
                isCode
              >
                {JSON.stringify(this.props.state)}
                <br />
                --------------------------------------
                <br />
                {this.state.error.replace(/\n/g, "")}
              </ClipboardCopy>
            </EmptyStateBody>
          </EmptyState>
        </div>
      );
    }
    return this.props.children;
  }
}

const mapStateToProps = (state: Store) => ({ state });

export default connect(mapStateToProps)(ErrorBoundary);
