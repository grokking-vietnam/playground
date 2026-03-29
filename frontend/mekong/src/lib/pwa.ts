/**
 * PWA utilities
 *
 * - Service worker registration
 * - Push notification subscription management
 * - Install prompt detection
 */

// ─── Service Worker ───────────────────────────────────────────────────────────

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!("serviceWorker" in navigator)) return null;

	try {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
		});

		registration.addEventListener("updatefound", () => {
			const newWorker = registration.installing;
			if (!newWorker) return;

			newWorker.addEventListener("statechange", () => {
				if (
					newWorker.state === "installed" &&
					navigator.serviceWorker.controller
				) {
					// New content is available – you can prompt the user to reload
					window.dispatchEvent(new CustomEvent("sw-update-available"));
				}
			});
		});

		return registration;
	} catch (err) {
		console.error("[PWA] Service worker registration failed:", err);
		return null;
	}
}

// ─── Push Notifications ───────────────────────────────────────────────────────

/** Convert a VAPID public key (base64url) to a Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushSubscriptionState =
	| "unsupported"
	| "denied"
	| "subscribed"
	| "unsubscribed";

/** Check the current push subscription state */
export async function getPushSubscriptionState(): Promise<PushSubscriptionState> {
	if (!("PushManager" in window) || !("serviceWorker" in navigator)) {
		return "unsupported";
	}

	const permission = Notification.permission;
	if (permission === "denied") return "denied";

	try {
		const registration = await navigator.serviceWorker.getRegistration();
		if (!registration) return "unsubscribed";

		const subscription = await registration.pushManager.getSubscription();
		return subscription ? "subscribed" : "unsubscribed";
	} catch {
		return "unsubscribed";
	}
}

/** Subscribe the current browser to push notifications */
export async function subscribeToPush(
	vapidPublicKey: string,
): Promise<PushSubscription | null> {
	if (!("PushManager" in window) || !("serviceWorker" in navigator)) {
		return null;
	}

	const permission = await Notification.requestPermission();
	if (permission !== "granted") return null;

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
		});

		// Send subscription to the backend; log but don't block on failure
		try {
			const res = await fetch("/api/push/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subscription }),
			});
			if (!res.ok) {
				console.warn("[PWA] Server failed to store subscription:", res.status);
			}
		} catch (fetchErr) {
			console.warn(
				"[PWA] Could not reach server to store subscription:",
				fetchErr,
			);
		}

		return subscription;
	} catch (err) {
		console.error("[PWA] Failed to subscribe to push:", err);
		return null;
	}
}

/** Unsubscribe the current browser from push notifications */
export async function unsubscribeFromPush(): Promise<boolean> {
	if (!("serviceWorker" in navigator)) return false;

	try {
		const registration = await navigator.serviceWorker.getRegistration();
		if (!registration) return false;

		const subscription = await registration.pushManager.getSubscription();
		if (!subscription) return true;

		const success = await subscription.unsubscribe();

		if (success) {
			await fetch("/api/push/unsubscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ endpoint: subscription.endpoint }),
			});
		}

		return success;
	} catch (err) {
		console.error("[PWA] Failed to unsubscribe from push:", err);
		return false;
	}
}

// ─── Install Prompt ───────────────────────────────────────────────────────────

/** Returns true when running in standalone (installed) mode */
export function isInstalledPWA(): boolean {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		// iOS Safari
		("standalone" in navigator &&
			(navigator as { standalone?: boolean }).standalone === true)
	);
}
