import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Store, disableCompactMode, enableCompactMode } from "../redux";

export const useCompactMode = (): {
  enableCompactModeCluster: () => void;
  disableCompactModeCluster: () => void;
} => {
  // Remove control plane
  // Use m5.4x as machineset for both control plane and ODF workload
  const clusterState = useSelector((store: Store) => store.cluster);
  const platform = clusterState.platform;
  const dispatch = useDispatch();
  const enableCompactModeCluster = React.useCallback(() => {
    dispatch(enableCompactMode(platform));
  }, [dispatch, platform]);
  const disableCompactModeCluster = React.useCallback(() => {
    dispatch(disableCompactMode(platform));
  }, [dispatch, platform]);
  return { enableCompactModeCluster, disableCompactModeCluster };
};
