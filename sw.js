const CACHE_NAME = 'financeflow-v2';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/db.js',
    './js/ui.js',
    './js/csv.js',
    './js/drive.js',
    './manifest.json',
    './assets/logo.svg',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets');
            // Using a strategy to handle external CDN failures during install
            return Promise.allSettled(ASSETS.map(url => cache.add(url)));
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Skip caching for Google Auth/API scripts to avoid interference
    if (event.request.url.includes('accounts.google.com') || event.request.url.includes('apis.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then(fetchRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    // Only cache internal assets dynamically
                    if (event.request.url.startsWith(self.location.origin)) {
                        cache.put(event.request.url, fetchRes.clone());
                    }
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Fallback for offline mode when asset is not in cache
            if (event.request.url.includes('.html')) {
                return caches.match('./index.html');
            }
        })
    );
});
