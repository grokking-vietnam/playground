/**
 * Push Notification Routes
 *
 * Handles Web Push subscription management and sending push messages.
 * Uses the VAPID protocol which is compatible with all browsers that
 * support Web Push, including Safari on iOS 16.4+.
 *
 * Required environment variables:
 *   VAPID_PUBLIC_KEY   – VAPID public key (base64url)
 *   VAPID_PRIVATE_KEY  – VAPID private key (base64url)
 *   VAPID_SUBJECT      – mailto: or https: URI identifying the sender
 *
 * Generate a key pair with:
 *   node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(k)"
 */

import express from "express";
import webPush from "web-push";

const router = express.Router();

// In-memory subscription store (replace with a database in production)
const subscriptions = new Map();

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@mekong.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
	console.warn(
		"[push] VAPID keys not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.\n" +
			"       Generate them with: node -e \"const wp=require('web-push'); console.log(wp.generateVAPIDKeys())\"",
	);
}

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key so clients can subscribe.
 */
router.get("/vapid-public-key", (req, res) => {
	if (!VAPID_PUBLIC_KEY) {
		return res
			.status(503)
			.json({ error: "Push notifications not configured on this server." });
	}
	res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/**
 * POST /api/push/subscribe
 * Stores a push subscription for the current user/device.
 *
 * Body: { subscription: PushSubscription }
 */
router.post("/subscribe", (req, res) => {
	const { subscription } = req.body;

	if (!subscription || !subscription.endpoint) {
		return res.status(400).json({ error: "Invalid subscription object." });
	}

	// Use the endpoint URL as a unique key
	subscriptions.set(subscription.endpoint, subscription);

	res.status(201).json({ message: "Subscription saved." });
});

/**
 * POST /api/push/unsubscribe
 * Removes a push subscription.
 *
 * Body: { endpoint: string }
 */
router.post("/unsubscribe", (req, res) => {
	const { endpoint } = req.body;

	if (!endpoint) {
		return res.status(400).json({ error: "endpoint is required." });
	}

	subscriptions.delete(endpoint);
	res.json({ message: "Subscription removed." });
});

/**
 * POST /api/push/send
 * Send a push notification to all subscribed clients.
 * Protected by the API_KEY environment variable when set.
 *
 * Body: { title: string, body: string, url?: string }
 */
router.post(
	"/send",
	(req, res, next) => {
		// Require the API_KEY header when the server has one configured
		const serverKey = process.env.API_KEY;
		if (serverKey) {
			const provided = req.headers["x-api-key"];
			if (provided !== serverKey) {
				return res.status(401).json({ error: "Unauthorized." });
			}
		}
		next();
	},
	async (req, res) => {
		if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
			return res
				.status(503)
				.json({ error: "Push notifications not configured on this server." });
		}

		const { title = "Mekong", body = "", url = "/" } = req.body;

		const payload = JSON.stringify({
			title,
			body,
			icon: "/icons/icon-192.png",
			data: { url },
		});

		const results = { sent: 0, failed: 0, removed: 0 };
		const sendPromises = [];

		for (const [endpoint, subscription] of subscriptions.entries()) {
			sendPromises.push(
				webPush
					.sendNotification(subscription, payload)
					.then(() => {
						results.sent++;
					})
					.catch((err) => {
						// 410 Gone = subscription expired / user unsubscribed
						if (err.statusCode === 410) {
							subscriptions.delete(endpoint);
							results.removed++;
						} else {
							results.failed++;
						}
					}),
			);
		}

		await Promise.all(sendPromises);
		res.json({ message: "Push notifications sent.", ...results });
	},
);

export { router as pushRouter };
