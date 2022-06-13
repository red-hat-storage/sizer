import classNames from "classnames";
import * as React from "react";
import "./icon.css";

type CommonIconProps = {
  addMarginToLeft?: boolean;
};

export const Dedicated: React.FC<CommonIconProps> = ({ addMarginToLeft }) => (
  <span
    className={classNames("dedicated-icon", {
      "dedicated-icon--marginLeft": addMarginToLeft,
    })}
  >
    Dedicated
  </span>
);
