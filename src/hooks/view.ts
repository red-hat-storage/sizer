import * as React from "react";

export const useVisibilityTracker = (elementID: string): boolean => {
  const [isVisible, setVisible] = React.useState(false);
  const cb: IntersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      setVisible(entry.isIntersecting);
    });
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(cb);
    const element = document.getElementById(elementID);
    observer.observe(element as Element);
    return () => {
      observer.unobserve(element as Element);
    };
  }, [elementID]);
  return isVisible;
};
