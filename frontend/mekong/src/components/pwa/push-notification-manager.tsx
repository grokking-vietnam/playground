import { Button } from "@/components/ui/button";
import {
	type PushSubscriptionState,
	getPushSubscriptionState,
	subscribeToPush,
	unsubscribeFromPush,
} from "@/lib/pwa";
import { useNotifications } from "@/lib/shared-state";
import { Bell, BellOff, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// VAPID public key injected at build time via modern.config.ts define.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/**
 * Push notification manager button
 *
 * Renders a bell icon that lets users subscribe or unsubscribe from push
 * notifications.  On iOS 16.4+ the browser must be added to the home screen
 * (standalone mode) before push notifications are available.
 */
export function PushNotificationManager() {
	const [state, setState] = useState<PushSubscriptionState>("unsubscribed");
	const [loading, setLoading] = useState(false);
	const [showIOSHint, setShowIOSHint] = useState(false);
	const { addNotification } = useNotifications();

	const checkState = useCallback(async () => {
		const current = await getPushSubscriptionState();
		setState(current);
	}, []);

	useEffect(() => {
		checkState();
	}, [checkState]);

	// iOS requires the app to be installed (standalone mode) for push
	useEffect(() => {
		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
		const isStandalone =
			("standalone" in navigator &&
				(navigator as { standalone?: boolean }).standalone === true) ||
			window.matchMedia("(display-mode: standalone)").matches;
		if (isIOS && !isStandalone) {
			setShowIOSHint(true);
		}
	}, []);

	const handleToggle = async () => {
		if (state === "unsupported") return;

		if (showIOSHint) {
			addNotification({
				type: "info",
				title: "Install app first",
				message:
					"To enable push notifications on iPhone, add Mekong to your Home Screen via Safari's Share menu.",
			});
			return;
		}

		setLoading(true);
		try {
			if (state === "subscribed") {
				await unsubscribeFromPush();
				setState("unsubscribed");
			} else {
				if (!VAPID_PUBLIC_KEY) {
					console.warn(
						"[PWA] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set. Push notifications will not work.",
					);
				}
				const subscription = await subscribeToPush(VAPID_PUBLIC_KEY);
				setState(subscription ? "subscribed" : "unsubscribed");
				if (subscription) {
					addNotification({
						type: "success",
						title: "Notifications enabled",
						message: "You will now receive push notifications from Mekong.",
					});
				}
			}
		} finally {
			setLoading(false);
		}
	};

	if (state === "unsupported" && !showIOSHint) return null;

	const label =
		state === "subscribed" ? "Disable notifications" : "Enable notifications";

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8"
			onClick={handleToggle}
			disabled={loading || state === "denied"}
			title={
				state === "denied" ? "Notifications blocked in browser settings" : label
			}
			aria-label={label}
		>
			{loading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : state === "subscribed" ? (
				<Bell className="h-4 w-4 text-primary" />
			) : (
				<BellOff className="h-4 w-4 text-muted-foreground" />
			)}
		</Button>
	);
}
