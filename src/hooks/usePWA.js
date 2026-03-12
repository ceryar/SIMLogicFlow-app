import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Endpoints to warm up when user authenticates (GET only, safe to cache)
const WARM_UP_ENDPOINTS = [
    '/api/v1/courses',
    '/api/v1/simulators',
    '/api/v1/rooms',
    '/api/v1/roles',
    '/api/v1/maintenance-types',
    '/api/v1/users',
    '/api/v1/pro-courses',
    '/api/v1/maintenances',
    '/api/v1/maintenance-history',
];

/**
 * Trigger a background cache warm-up by making GET requests
 * to all key endpoints so they are stored in the SW cache.
 */
async function warmUpCache() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    await Promise.allSettled(
        WARM_UP_ENDPOINTS.map(url =>
            axios.get(url, { headers }).catch(() => { })
        )
    );
}

/**
 * usePWA — Hook to manage:
 * - Online / offline status
 * - Service Worker update notifications
 * - Install prompt (PWA installable)
 * - Cache warm-up after authentication
 */
export function usePWA() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(
        window.matchMedia('(display-mode: standalone)').matches
    );
    const [cacheReady, setCacheReady] = useState(false);

    // ── Online / Offline events ─────────────────────────────────────────────
    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    // ── Service Worker registration & update detection ──────────────────────
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.ready.then(reg => {
            setRegistration(reg);

            // Detect a waiting SW (update available)
            if (reg.waiting) setUpdateAvailable(true);

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        setUpdateAvailable(true);
                    }
                });
            });
        });

        // Reload page when a new SW takes control
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) { refreshing = true; window.location.reload(); }
        });
    }, []);

    // ── Apply SW update (send skipWaiting) ─────────────────────────────────
    const applyUpdate = useCallback(() => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }, [registration]);

    // ── Install prompt (Add to Home Screen) ────────────────────────────────
    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        });
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const installApp = useCallback(async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') setIsInstalled(true);
        setInstallPrompt(null);
    }, [installPrompt]);

    // ── Cache warm-up: call this after login ───────────────────────────────
    const triggerCacheWarmUp = useCallback(async () => {
        await warmUpCache();
        setCacheReady(true);
    }, []);

    return {
        isOnline,
        updateAvailable,
        applyUpdate,
        canInstall: !!installPrompt && !isInstalled,
        installApp,
        isInstalled,
        cacheReady,
        triggerCacheWarmUp,
    };
}
