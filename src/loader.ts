// 2 hours
const UPDATE_CHECK_INTERVAL = 10 * 1000;

export const initServiceWorker = () => {
  let newWorker: ServiceWorker;
  let refreshing = false;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((reg) => {
        //check for updates periodically
        setInterval(() => reg.update(), UPDATE_CHECK_INTERVAL);
        console.log("Service Worker registration is successful!");
        reg.addEventListener("updatefound", () => {
          newWorker = reg.installing as ServiceWorker;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              const notification = document.getElementById("notification");
              (notification as HTMLElement).className = "show";
            }
          });
        });
      })
      .catch((err) => console.log("Service Worker registration failed", err));

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  }

  const notification = document.getElementById("notification");
  if (notification) {
    notification.addEventListener("click", () => {
      newWorker.postMessage({ action: "skipWaiting" });
    });
  }
};
