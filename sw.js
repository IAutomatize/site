/**
 * Service Worker - IAutomatize Blog
 * PWA Implementation with Advanced Caching Strategy
 */

const CACHE_NAME = 'iautomatize-blog-v3.0';
const STATIC_CACHE = 'static-v3.0';
const DYNAMIC_CACHE = 'dynamic-v3.0';
const IMAGE_CACHE = 'images-v3.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/blog.html',
    '/index.html',
    '/blog-optimized.css',
    '/blog-optimized.js',
    '/favicon.ico',
    '/apple-touch-icon.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Network-first URLs (always try network first)
const NETWORK_FIRST = [
    '/sitemap.xml',
    '/api/',
    '/blog/api/'
];

// Cache-first URLs (serve from cache, update in background)
const CACHE_FIRST = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then(cacheNames => {
                const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
                return Promise.all(
                    cacheNames
                        .filter(cacheName => !validCaches.includes(cacheName))
                        .map(cacheName => {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            
            // Take control of all pages
            self.clients.claim()
        ])
    );
});

// Fetch Event - Implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(handleRequest(request));
});

// Main request handler with different strategies
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Network First (for dynamic content)
        if (shouldUseNetworkFirst(url)) {
            return await networkFirst(request);
        }
        
        // Strategy 2: Cache First (for static assets)
        if (shouldUseCacheFirst(url)) {
            return await cacheFirst(request);
        }
        
        // Strategy 3: Stale While Revalidate (for images)
        if (isImage(request)) {
            return await staleWhileRevalidate(request, IMAGE_CACHE);
        }
        
        // Strategy 4: Cache First with Network Fallback (default)
        return await cacheFirstWithNetworkFallback(request);
        
    } catch (error) {
        console.error('❌ Fetch error:', error);
        return handleFetchError(request, error);
    }
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful network responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Cache First Strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    // Fetch and cache if not in cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
            const cache = caches.open(cacheName);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    }).catch(() => null);
    
    // Return cached version immediately, update in background
    return cachedResponse || await networkResponsePromise;
}

// Cache First with Network Fallback
async function cacheFirstWithNetworkFallback(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Update cache in background
async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            await cache.put(request, networkResponse);
        }
    } catch (error) {
        console.log('Background cache update failed:', error);
    }
}

// Handle fetch errors
function handleFetchError(request, error) {
    const url = new URL(request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        return caches.match('/offline.html') || 
               new Response('Você está offline. Verifique sua conexão.', {
                   status: 503,
                   statusText: 'Service Unavailable',
                   headers: { 'Content-Type': 'text/html' }
               });
    }
    
    // Return placeholder for images
    if (isImage(request)) {
        return caches.match('/offline-image.svg') ||
               new Response(generateOfflineImageSVG(), {
                   headers: { 'Content-Type': 'image/svg+xml' }
               });
    }
    
    // Return empty response for other requests
    return new Response('Offline', { status: 503 });
}

// Utility functions
function shouldUseNetworkFirst(url) {
    return NETWORK_FIRST.some(pattern => url.pathname.includes(pattern));
}

function shouldUseCacheFirst(url) {
    return CACHE_FIRST.some(pattern => url.hostname.includes(pattern));
}

function isImage(request) {
    return request.destination === 'image' || 
           /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

function generateOfflineImageSVG() {
    return `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="#1A1A1A"/>
            <text x="200" y="150" text-anchor="middle" fill="#8B5CF6" font-family="Arial" font-size="16">
                Imagem indisponível offline
            </text>
        </svg>
    `;
}

// Background Sync
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'newsletter-signup') {
        event.waitUntil(syncNewsletterSignups());
    }
    
    if (event.tag === 'analytics-events') {
        event.waitUntil(syncAnalyticsEvents());
    }
});

// Sync offline newsletter signups
async function syncNewsletterSignups() {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['newsletter'], 'readwrite');
        const store = transaction.objectStore('newsletter');
        const signups = await getAllFromStore(store);
        
        for (const signup of signups) {
            try {
                await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signup)
                });
                
                // Remove from IndexedDB after successful sync
                await store.delete(signup.id);
                
            } catch (error) {
                console.log('Failed to sync signup:', signup.email);
            }
        }
    } catch (error) {
        console.error('Newsletter sync failed:', error);
    }
}

// Sync offline analytics events
async function syncAnalyticsEvents() {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        const events = await getAllFromStore(store);
        
        for (const event of events) {
            try {
                // Send to Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', event.name, event.data);
                }
                
                // Send to custom analytics endpoint
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });
                
                await store.delete(event.id);
                
            } catch (error) {
                console.log('Failed to sync event:', event.name);
            }
        }
    } catch (error) {
        console.error('Analytics sync failed:', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    const options = {
        body: 'Novos artigos sobre IA e automação disponíveis!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'blog-update',
        data: {
            url: '/blog.html'
        },
        actions: [
            {
                action: 'view',
                title: 'Ver artigos',
                icon: '/icons/view-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dispensar',
                icon: '/icons/dismiss-icon.png'
            }
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.data.url = data.url || options.data.url;
        } catch (error) {
            console.log('Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('IAutomatize Blog', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        const url = event.notification.data.url || '/blog.html';
        
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window/tab if none found
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    }
    
    // Track notification interaction
    event.waitUntil(
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'notification_click',
                action: event.action || 'default',
                timestamp: Date.now()
            })
        }).catch(() => {
            // Store for later sync if offline
            storeAnalyticsEvent({
                event: 'notification_click',
                action: event.action || 'default',
                timestamp: Date.now()
            });
        })
    );
});

// IndexedDB helpers
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('IAutomatizeBlog', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('newsletter')) {
                const newsletterStore = db.createObjectStore('newsletter', { keyPath: 'id', autoIncrement: true });
                newsletterStore.createIndex('email', 'email', { unique: false });
                newsletterStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('analytics')) {
                const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
                analyticsStore.createIndex('event', 'event', { unique: false });
                analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

function getAllFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function storeAnalyticsEvent(eventData) {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        await store.add({
            ...eventData,
            id: Date.now() + Math.random()
        });
    } catch (error) {
        console.error('Failed to store analytics event:', error);
    }
}

// Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
    console.log('⏰ Periodic sync triggered:', event.tag);
    
    if (event.tag === 'content-update') {
        event.waitUntil(updateBlogContent());
    }
});

// Update blog content in background
async function updateBlogContent() {
    try {
        // Fetch latest sitemap
        const response = await fetch('/sitemap.xml', { cache: 'no-cache' });
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put('/sitemap.xml', response);
            console.log('📄 Sitemap updated in background');
        }
        
        // Pre-cache new blog articles
        const sitemapText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
        const urls = xmlDoc.getElementsByTagName("url");
        
        const blogUrls = Array.from(urls)
            .map(url => url.getElementsByTagName("loc")[0]?.textContent)
            .filter(url => url && url.includes('/blog/') && url.endsWith('.html'))
            .slice(0, 5); // Pre-cache only 5 most recent
        
        const cache = await caches.open(DYNAMIC_CACHE);
        
        for (const url of blogUrls) {
            try {
                const articleResponse = await fetch(url);
                if (articleResponse.ok) {
                    await cache.put(url, articleResponse);
                }
            } catch (error) {
                console.log('Failed to pre-cache:', url);
            }
        }
        
        console.log('📚 Pre-cached latest blog articles');
        
    } catch (error) {
        console.error('Content update failed:', error);
    }
}

// Cache Management
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        event.waitUntil(updateCaches());
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

async function updateCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('iautomatize-blog-') && name !== CACHE_NAME
    );
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    console.log('🧹 Old caches cleaned');
}

// Error reporting
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
    
    // Report critical errors
    fetch('/api/error-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'service-worker-error',
            message: event.error.message,
            stack: event.error.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        })
    }).catch(() => {
        // Ignore if offline
    });
});

console.log('🚀 Service Worker loaded successfully');