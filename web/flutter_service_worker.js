'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "29983d195bdac0b9a25fca77993455f8",
"assets/AssetManifest.bin.json": "34df78f09dacbde270effd489d8cec57",
"assets/AssetManifest.json": "ea0d5fc013e2fe8458a21e4fb5697c45",
"assets/assets/audio/funnycat.mp3": "aaae08b6e5145a7b6320537a94682dbf",
"assets/assets/audio/ping.mp3": "b8865fa01bc0f056d442c2c26956c8a8",
"assets/assets/audio/soundcopyright.txt": "90a37751f2e67dd6e1adaf36cc161979",
"assets/assets/font/barlowcondensedbold.ttf": "0abc11955dc269acff39ccd5921d6daa",
"assets/assets/font/ownglyph.ttf": "19c2465bf8122ca03e86b21f65729b52",
"assets/assets/font/ownglyphphysicspucca.ttf": "090eda968d8a57a850f76727fc0ad34d",
"assets/assets/font/Pretendard-Regular.otf": "84c0ea9d65324c758c8bd9686207afea",
"assets/assets/font/PretendardVariable.ttf": "872a6c5775ec910058a9a409a201972a",
"assets/assets/images/bedbug.svg": "f8b27addae61b9b607c29eb4d65f4118",
"assets/assets/images/gps.svg": "efbd630a47ca6e4d501cd44392354e24",
"assets/assets/images/questionmark.svg": "f776e4b46dd57aa0e93762fdbe5b000f",
"assets/FontManifest.json": "ba362ed42815b618ee426de9d822e89e",
"assets/fonts/MaterialIcons-Regular.otf": "fce4dfb22dd2e951f43785891e4af1ac",
"assets/NOTICES": "dd7839fc5064dd8cf6631ff0ebed55b4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/packages/flutter_map/lib/assets/flutter_map_logo.png": "208d63cc917af9713fc9572bd5c09362",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "321aa0c874f6112cabafc27a74a784b4",
"canvaskit/canvaskit.js.symbols": "ac01b6cbb645f360ca2895570c643303",
"canvaskit/canvaskit.wasm": "c4617295691b28369ad130c3ea27d640",
"canvaskit/chromium/canvaskit.js": "bc979fce6b4b3cc75d54b0d162cafaa7",
"canvaskit/chromium/canvaskit.js.symbols": "98378de0c2c63b0d282826a2482c854c",
"canvaskit/chromium/canvaskit.wasm": "73b16d4d822ebb8e922fda36783cec74",
"canvaskit/skwasm.js": "411f776c9a5204d1e466141767f5a8fa",
"canvaskit/skwasm.js.symbols": "90438aedfcf3bb766218a1385148faeb",
"canvaskit/skwasm.wasm": "f5fb55ff49251ef3ab73be6bd7a066f4",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "c71a09214cb6f5f8996a531350400a9a",
"icons/favicon.png": "a6d927fe25470e9e3300cecf989f79d3",
"icons/Icon-192.png": "8842519e7376003cba9dafa5c9d9768f",
"icons/Icon-512.png": "c9ac0fdc8aaacd1b0ed82e4c4e615ec0",
"icons/Icon-maskable-192.png": "8842519e7376003cba9dafa5c9d9768f",
"icons/Icon-maskable-512.png": "c9ac0fdc8aaacd1b0ed82e4c4e615ec0",
"index.html": "7145d65201518490be3575214ab4ae1a",
"/": "7145d65201518490be3575214ab4ae1a",
"main.dart.js": "7999289375fb41909c7c1261913db965",
"manifest.json": "99b972faccb19a641a4f4f7f049dc010",
"version.json": "9030b8cb72b7fbffd60619203f4a3d19"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
