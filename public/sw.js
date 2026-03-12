/**
 * SimLogicFlow — Service Worker v3
 *
 * FIX CRÍTICO v3: Las peticiones de la API van con header 'Authorization: Bearer ...'
 * El caché de la API usa la REQUEST como clave, incluyendo headers.
 * Si el token cambia o difiere, cache.match(request) no encuentra nada.
 *
 * SOLUCIÓN: Para endpoints de la API, se usa la URL pura (string) como clave de caché,
 * descartando todos los headers. Así un mismo endpoint siempre encuentra
 * su entrada en caché independientemente del token.
 *
 * ENDPOINTS CON CACHÉ (solo GET):
 *   CATÁLOGO  → StaleWhileRevalidate 24h
 *     /courses, /simulators, /rooms, /roles, /maintenance-types  (y /{id})
 *   DINÁMICO → NetworkFirst 5 s / TTL 2h
 *     /users, /users/{id}, /users/{id}/courses
 *     /pro-courses, /maintenances, /maintenance-history  (y /{id})
 *   AUTH    → NetworkOnly (nunca cachear)
 *     /api/v1/auth/**
 */

const CACHE_VERSION = 'slf-v3';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_CATALOG = `${CACHE_VERSION}-catalog`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_NAVIGATION = `${CACHE_VERSION}-navigation`;

const ALL_CACHES = [CACHE_STATIC, CACHE_CATALOG, CACHE_DYNAMIC, CACHE_NAVIGATION];

const TTL_CATALOG = 24 * 60 * 60 * 1000;  // 24 h
const TTL_DYNAMIC = 2 * 60 * 60 * 1000;  //  2 h
const NETWORK_TIMEOUT_MS = 5000;                  //  5 s

// ── Patrones de URL ────────────────────────────────────────────────────────────
const RE_AUTH = /\/api\/v1\/auth\//;
const RE_CATALOG = /\/api\/v1\/(courses|simulators|rooms|roles|maintenance-types)(\/|$|\?)/;
const RE_DYNAMIC = /\/api\/v1\/(users|pro-courses|maintenances|maintenance-history)(\/|$|\?)/;
const RE_API = /\/api\/v1\//;

// ─────────────────────────────────────────────────────────────────────────────
// CLAVE DE CACHÉ — SOLO LA URL (sin headers, sin token)
// Esto es el fix principal: los headers Authorization no forman parte de la clave.
// ─────────────────────────────────────────────────────────────────────────────
function cacheKey(request) {
    // Usamos la URL normalizada como clave string → ignora TODOS los headers
    return request.url;
}

// ── Helper: respuesta offline JSON ────────────────────────────────────────────
function offlineFallback(pathname) {
    const labels = {
        users: 'usuarios',
        courses: 'cursos',
        simulators: 'simuladores',
        rooms: 'aulas',
        roles: 'roles',
        'maintenance-types': 'tipos de mantenimiento',
        'pro-courses': 'programaciones',
        maintenances: 'mantenimientos',
        'maintenance-history': 'historial',
    };
    const segment = pathname.split('/')[3] || '';
    const label = labels[segment] || 'datos';
    return new Response(
        JSON.stringify({ offline: true, message: `Sin conexión — ${label} no disponibles` }),
        {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'application/json', 'X-Offline': 'true' }
        }
    );
}

// ── Guardar respuesta en caché usando la URL como clave ───────────────────────
async function saveToCache(cacheName, request, response) {
    if (!response || (!response.ok && response.status !== 0)) return;
    try {
        const body = await response.clone().arrayBuffer();
        const headers = new Headers(response.headers);
        headers.set('X-Cache-Time', String(Date.now()));
        // ⚠️  La CLAVE es la URL string, NO la request original con sus headers
        const key = cacheKey(request);
        const cached = new Response(body, { status: response.status, statusText: response.statusText, headers });
        const cache = await caches.open(cacheName);
        await cache.put(key, cached);
    } catch (e) {
        console.warn('[SW] No se pudo guardar en caché:', e);
    }
}

// ── Leer desde caché usando la URL como clave ─────────────────────────────────
async function readFromCache(cacheName, request) {
    const cache = await caches.open(cacheName);
    // Buscar por URL string — ignora headers de la request original
    return cache.match(cacheKey(request));
}

// ── Verificar TTL ─────────────────────────────────────────────────────────────
function isExpired(cachedRes, ttlMs) {
    if (!cachedRes) return true;
    const t = Number(cachedRes.headers.get('X-Cache-Time') || 0);
    return (Date.now() - t) > ttlMs;
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAVIGATION)
            .then(c => c.addAll(['/', '/index.html']).catch(() => { }))
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE — elimina cachés de versiones anteriores
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => !ALL_CACHES.includes(k))
                    .map(k => { console.log('[SW] Borrando caché antiguo:', k); return caches.delete(k); })
            ))
            .then(() => self.clients.claim())
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH — enrutador principal
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo GET — mutaciones (POST/PUT/DELETE) siempre a la red
    if (request.method !== 'GET') return;

    // Auth: NetworkOnly (nunca cachear credenciales)
    if (RE_AUTH.test(url.pathname)) return;

    // Catálogo: StaleWhileRevalidate 24h
    if (RE_CATALOG.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request, CACHE_CATALOG, TTL_CATALOG));
        return;
    }

    // Datos dinámicos: NetworkFirst 5s / TTL 2h
    if (RE_DYNAMIC.test(url.pathname)) {
        event.respondWith(networkFirst(request, CACHE_DYNAMIC, TTL_DYNAMIC));
        return;
    }

    // Cualquier otro endpoint /api/v1/: NetworkFirst genérico
    if (RE_API.test(url.pathname)) {
        event.respondWith(networkFirst(request, CACHE_DYNAMIC, TTL_DYNAMIC));
        return;
    }

    // Navegación SPA
    if (request.mode === 'navigate') {
        event.respondWith(navigationStrategy(request));
        return;
    }

    // Assets estáticos
    if (['style', 'script', 'image', 'font'].includes(request.destination)) {
        event.respondWith(cacheFirst(request, CACHE_STATIC));
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ESTRATEGIAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * StaleWhileRevalidate
 * - Responde con caché fresco inmediatamente
 * - Actualiza en background
 * - Si no hay caché o expiró → espera red
 * - Si red falla → usa caché aunque esté expirado
 */
async function staleWhileRevalidate(request, cacheName, ttlMs) {
    const cached = await readFromCache(cacheName, request);

    // Lanzar actualización en background (siempre)
    const networkPromise = fetch(request.clone())
        .then(res => { saveToCache(cacheName, request, res.clone()); return res; })
        .catch(() => null);

    // Hay caché fresco → responder inmediatamente
    if (cached && !isExpired(cached, ttlMs)) {
        return cached.clone();
    }

    // Sin caché o expirado → esperar la red
    try {
        const netRes = await networkPromise;
        if (netRes && netRes.ok) return netRes;
    } catch { /* continúa al fallback */ }

    // Ultimo recurso: caché expirado
    if (cached) {
        console.warn('[SW] SWR — usando caché expirado offline:', request.url);
        return cached.clone();
    }

    return offlineFallback(new URL(request.url).pathname);
}

/**
 * NetworkFirst con timeout de 5 s
 * - Intenta la red; si tarda > 5 s o falla → usa caché
 * - Sin caché → respuesta offline
 */
async function networkFirst(request, cacheName, ttlMs) {
    return new Promise(resolve => {
        let done = false;

        const settle = (res) => {
            if (!done) { done = true; resolve(res); }
        };

        // Timer de timeout → caída al caché
        const timer = setTimeout(async () => {
            console.warn('[SW] Timeout 5 s para:', request.url);
            const cached = await readFromCache(cacheName, request);
            settle(cached ? cached.clone() : offlineFallback(new URL(request.url).pathname));
        }, NETWORK_TIMEOUT_MS);

        fetch(request.clone())
            .then(res => {
                clearTimeout(timer);
                if (res.ok || res.status === 0) {
                    saveToCache(cacheName, request, res.clone());
                }
                settle(res);
            })
            .catch(async () => {
                clearTimeout(timer);
                console.warn('[SW] Red caída para:', request.url);
                const cached = await readFromCache(cacheName, request);
                settle(cached ? cached.clone() : offlineFallback(new URL(request.url).pathname));
            });
    });
}

/**
 * CacheFirst — assets estáticos
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const res = await fetch(request);
        if (res.ok) await cache.put(request, res.clone());
        return res;
    } catch {
        return new Response('Asset no disponible offline', { status: 503 });
    }
}

/**
 * Navegación SPA — sirve index.html en offline
 */
async function navigationStrategy(request) {
    try {
        const res = await fetch(request);
        if (res.ok) {
            const c = await caches.open(CACHE_NAVIGATION);
            await c.put(request, res.clone());
        }
        return res;
    } catch {
        const c = await caches.open(CACHE_NAVIGATION);
        return (
            await c.match(request) ||
            await c.match('/') ||
            await c.match('/index.html') ||
            new Response('App no disponible offline', { status: 503 })
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MENSAJE → skipWaiting (actualización manual desde la UI)
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
