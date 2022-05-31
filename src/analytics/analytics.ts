import * as React from "react";
import GA4React from "ga-4-react";
import { GA4ReactResolveInterface } from "ga-4-react/dist/models/gtagModels";

let GA4Initialized: GA4ReactResolveInterface = null;

enum Analytics {
  BETA = "beta",
  PROD = "production",
}

const AnalyticsIDs = {
  [Analytics.BETA]: "G-2VNW0PFP8D",
  [Analytics.PROD]: "G-G4ETCF6QL5",
};

const BETA_TAG = "/beta/";

const TRACKED_PLATFORMS = [
  "sizer.odf.ninja",
  "sizer.ocs.ninja",
  "storage.googleapis.com",
  "access.redhat.com",
];

type UseAnalytics = (useDebug?: boolean) => Promise<GA4ReactResolveInterface>;

export const useGetAnalyticID = (useDebug?: boolean): string => {
  if (!TRACKED_PLATFORMS.includes(window.location.host) && !useDebug) {
    return null;
  }

  const pathName = window.location.pathname;
  const isBeta = pathName.includes(BETA_TAG);
  const isLocal = window.location.href.includes("localhost");

  const id = (() => {
    if ((isLocal && useDebug) || isBeta) {
      return AnalyticsIDs[Analytics.BETA];
    }
    if (!isLocal && !isBeta) {
      return AnalyticsIDs[Analytics.PROD];
    }
    return null;
  })();

  return id;
};

export const useGetAnalyticClientID = (useDebug?: boolean): string => {
  const analyticsID = useGetAnalyticID(useDebug);
  const analytics = useAnalytics(useDebug);
  const [clientID, setClientID] = React.useState<string>(null);

  React.useEffect(() => {
    Promise.resolve(analytics).then((a) =>
      a.gtag("get", analyticsID, "client_id", (id) => {
        setClientID(id);
        console.log("Id for client is: ", id);
      })
    );
  }, [analyticsID, analytics]);
  return clientID;
};

const useAnalytics: UseAnalytics = (useDebug) => {
  const id = useGetAnalyticID(useDebug);
  const gaItem = React.useMemo(async () => {
    if (GA4Initialized) {
      return GA4Initialized;
    } else {
      const ga4Item = new GA4React(id, { send_page_view: true });
      const initialized = await ga4Item.initialize();
      GA4Initialized = initialized;
      return initialized;
    }
  }, [id]);

  return gaItem;
};

export default useAnalytics;
