document.addEventListener("DOMContentLoaded", function () {
  mdc.ripple.MDCRipple.attachTo(document.querySelector(".foo-button"));
  document.querySelector(".foo-button").addEventListener("click", (e) => {
    registerSync();
  });
});

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        {
          scope: "/",
        }
      );
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

// …

registerServiceWorker();

// SYNC EVENT
async function registerSync() {
  console.log("register sync");
  const swRegistration = await navigator.serviceWorker.ready;
  swRegistration.sync.register("send-message");
}
