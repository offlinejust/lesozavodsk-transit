const CACHE_NAME = 'leso-tiles-v1';
const TILE_PATTERNS = [
    /tile\.openstreetmap\.org/,
    /basemaps\.cartocdn\.com/,
    /диспетчер-автобусов\.рф/
];

// Установка SW
self.addEventListener('install', (event) => {
    console.log('[SW] Install');
    self.skipWaiting();
});

// Активация SW
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate');
    event.waitUntil(self.clients.claim());
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // Проверяем, это запрос тайла?
    if (!TILE_PATTERNS.some(pattern => pattern.test(url))) {
        return; // Не наш запрос, игнорируем
    }
    
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(event.request);
            
            if (cachedResponse) {
                console.log('[SW] Cache hit:', url);
                return cachedResponse;
            }

            try {
                const networkResponse = await fetch(event.request);
                
                if (networkResponse.ok) {
                    console.log('[SW] Caching:', url);
                    cache.put(event.request, networkResponse.clone());
                }
                
                return networkResponse;
            } catch (error) {
                console.log('[SW] Network failed, no cache:', url);
                return new Response('', { status: 504 });
            }
        })
    );
});