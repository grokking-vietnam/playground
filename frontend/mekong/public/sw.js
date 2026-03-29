/**
 * Mekong PWA Service Worker
 *
 * Handles:
 * - App shell caching for offline support
 * - Push notification events (iOS 16.4+ / Web Push API)
 * - Background sync for deferred actions
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `mekong-${CACHE_VERSION}`;

// Assets to pre-cache (app shell)
const PRECACHE_URLS = [
	"/",
	"/manifest.webmanifest",
	"/icons/icon-192.png",
	"/icons/icon-512.png",
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Skip non-GET requests
	if (event.request.method !== "GET") return;

	// Skip cross-origin requests (CDN assets, APIs, etc.)
	if (url.origin !== self.location.origin) return;

	// API requests: network-first, no cache
	if (url.pathname.startsWith("/api/")) {
		event.respondWith(
			fetch(event.request).catch(
				() =>
					new Response(
						JSON.stringify({
							error: "You are offline. Please check your connection.",
						}),
						{ status: 503, headers: { "Content-Type": "application/json" } },
					),
			),
		);
		return;
	}

	// App shell & static assets: stale-while-revalidate
	event.respondWith(
		caches.open(CACHE_NAME).then(async (cache) => {
			const cached = await cache.match(event.request);
			const fetchPromise = fetch(event.request)
				.then((response) => {
					if (response && response.status === 200) {
						cache.put(event.request, response.clone());
					}
					return response;
				})
				.catch(() => cached);

			return cached || fetchPromise;
		}),
	);
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
	let data = {
		title: "Mekong",
		body: "You have a new notification",
		icon: "/icons/icon-192.png",
		badge: "/icons/icon-72.png",
		tag: "mekong-notification",
		data: {},
	};

	if (event.data) {
		try {
			const payload = event.data.json();
			data = { ...data, ...payload };
		} catch {
			data.body = event.data.text();
		}
	}

	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: data.icon,
			badge: data.badge,
			tag: data.tag,
			data: data.data,
			// requireInteraction: false is the default and is the only accepted
			// value on iOS; desktop Chrome supports true but we keep it consistent.
			requireInteraction: false,
			// Vibration pattern (Android; ignored on iOS)
			vibrate: [200, 100, 200],
		}),
	);
});

// ─── Notification Click ───────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const urlToOpen = event.notification.data?.url || "/";

	event.waitUntil(
		self.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientList) => {
				// Focus existing window if already open
				for (const client of clientList) {
					if (client.url === urlToOpen && "focus" in client) {
						return client.focus();
					}
				}
				// Otherwise open a new window
				if (self.clients.openWindow) {
					return self.clients.openWindow(urlToOpen);
				}
			}),
	);
});

// ─── Push Subscription Change ─────────────────────────────────────────────────

self.addEventListener("pushsubscriptionchange", (event) => {
	// Re-subscribe and notify the server when the push subscription expires
	event.waitUntil(
		self.registration.pushManager
			.subscribe({
				userVisibleOnly: true,
				applicationServerKey: self.__VAPID_PUBLIC_KEY__,
			})
			.then((subscription) =>
				fetch("/api/push/subscribe", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ subscription }),
				}),
			),
	);
});
