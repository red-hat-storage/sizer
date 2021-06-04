import * as React from "react";

export const useCloseModal = (onClose: () => void, isOpen: boolean): void => {
  React.useEffect(() => {
    const modal = document.getElementsByClassName("pf-c-modal-box").item(0);
    const cb = (event: React.FormEvent<MouseEvent>) => {
      const currentlySelected = event?.target;
      if (!modal?.contains(currentlySelected as Node) && isOpen) {
        onClose();
      }
    };
    document?.addEventListener("click", cb as any);
    return () => {
      document?.removeEventListener("click", cb as any);
    };
  }, [isOpen]);
};
