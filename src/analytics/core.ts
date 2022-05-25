import { API_SECRET, MEASUREMENT_ID } from "./constants";

type CustomEventParameters = {
  [paramKey: string]: string;
};

/* This uses GA4s Measurement Protocol(beta) to push custom HTTP events) */

export const customEventPusher = async (
  eventName: string,
  parameters: CustomEventParameters,
  clientID: string
): ReturnType<typeof fetch> => {
  return fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: clientID,
        events: [
          {
            name: eventName,
            params: {
              ...parameters,
            },
          },
        ],
      }),
    }
  );
};
