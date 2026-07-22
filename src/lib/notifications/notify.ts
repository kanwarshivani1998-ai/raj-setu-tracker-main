import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

/** True jab app native Android/iOS shell (Capacitor) ke andar chal rahi ho. */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Notification permission check karta hai — native app me Capacitor ka
 * LocalNotifications plugin use hota hai (web ka Notification API APK
 * WebView me available nahi hota, isiliye "yeh डिवाइस समर्थन नहीं करता" error आता था),
 * browser me web Notification API fallback ke roop me use hota hai.
 */
export async function isNotificationSupported(): Promise<boolean> {
  if (isNative()) return true;
  return typeof Notification !== "undefined";
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    const { display } = await LocalNotifications.checkPermissions();
    return display === "granted";
  }
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

/** Permission maangta hai. Return: granted hua ya nahi. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  }
  if (typeof Notification === "undefined") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

/** Turant ek notification dikhata hai (native ya web, jo bhi available ho). */
export async function fireNotification(title: string, body: string, id = Date.now() % 2147483647) {
  if (isNative()) {
    await LocalNotifications.schedule({
      notifications: [{ id, title, body, schedule: { at: new Date(Date.now() + 300) } }],
    });
    return;
  }
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

/**
 * Daily reminder ko exact time par repeat hone ke liye schedule karta hai.
 * Native par yeh OS-level alarm hai (app band/kill hone par bhi chalta hai);
 * web par sirf tab tak chalta hai jab tak tab khula hai.
 */
export async function scheduleDailyNative(id: number, title: string, body: string, hhmm: string) {
  const [hour, minute] = hhmm.split(":").map(Number);
  await LocalNotifications.cancel({ notifications: [{ id }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
      },
    ],
  });
}

export async function cancelNative(id: number) {
  await LocalNotifications.cancel({ notifications: [{ id }] });
}
