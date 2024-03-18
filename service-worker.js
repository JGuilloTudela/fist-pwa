// service-worker.js
const CACHE_VERSION = "v4";
const addResourcesToCache = async (resources) => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.addAll(resources);
};

//CACHE DYNAMICALLY THE REST OF THE FETCH REQUESTS
const putInCache = async (request, response) => {
  const cache = await caches.open("dynamic");
  await cache.put(request, response);
};


// PRE-CACHE ON INSTALL
self.addEventListener("install", (event) => {
  console.log("install", event);
  event.waitUntil(
    addResourcesToCache(["/", "/index.html", "/style.scss", "/src/js/app.js"])
  );
});

self.addEventListener("fetch", (event) => {
  console.log("fetch", event);
  event.respondWith(
    cacheFirst({
      request: event.request,
      fallbackUrl: "/fallback.html",
    })
  );
});

this.addEventListener("activate", (event) => {
  const cacheAllowlist = [CACHE_VERSION, "dynamic"];
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (!cacheAllowlist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// self.addEventListener('activate', function(event) {
//   console.log('[Service Worker] Activating Service Worker ....', event);
//   return self.clients.claim();
// });


const cacheFirst = async ({ request, fallbackUrl }) => {
  // First try to get the resource from the cache.
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // If the response was not found in the cache,
  // try to get the resource from the network.
  try {
    const responseFromNetwork = await fetch(request);
    // If the network request succeeded, clone the response:
    // - put one copy in the cache, for the next time
    // - return the original to the app
    // Cloning is needed because a response can only be consumed once.
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    // If the network request failed,
    // get the fallback response from the cache.
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // When even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object.
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

// SYNC EVENT
self.addEventListener("sync", (event) => {
  if (event.tag == "send-message") {
    event.waitUntil(console.log("Message sent"));
  }
});
