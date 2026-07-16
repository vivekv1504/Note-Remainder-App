// Helpers for OS-level Web Notifications.
//
// Toasts (react-toastify) only appear while the app tab is focused. To also
// reach the user when the app is minimized / in the background (browser still
// running), we surface a real system notification through the service worker
// registration, falling back to the Notification constructor.
//
// NOTE: A fully *closed* / swiped-away PWA cannot run JS, so delivering
// reminders in that state requires server-driven push (e.g. FCM). That is out
// of scope here; this covers the common backgrounded-tab / minimized case.

const supportsNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window;

/**
 * Request notification permission if it hasn't been decided yet.
 * Returns true when permission is granted.
 */
export async function ensureNotificationPermission() {
  if (!supportsNotifications()) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return false;
  }
}

/**
 * Show an OS-level notification for a reminder. Prefers the service worker
 * registration (works on Android/Chrome and when backgrounded) and falls back
 * to the Notification constructor on desktop browsers without an active SW.
 */
export async function showSystemNotification({ title, body, tag, url }) {
  if (!supportsNotifications() || Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body,
    tag,
    renotify: true,
    requireInteraction: false,
    icon: `${import.meta.env.BASE_URL}App_icon.png`,
    badge: `${import.meta.env.BASE_URL}App_icon.png`,
    data: { url: url || import.meta.env.BASE_URL },
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, options);
        return;
      }
    }
  } catch (error) {
    // Fall through to the constructor-based fallback below.
    console.warn('[Notifications] SW notification failed, falling back:', error);
  }

  try {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('[Notifications] Notification fallback failed:', error);
  }
}
