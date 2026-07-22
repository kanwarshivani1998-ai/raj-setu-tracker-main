import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, XCircle } from "lucide-react";
import { useData } from "@/lib/db/DataContext";
import { beepOnce } from "@/lib/audio/audioContext";
import { fireNotification, hasNotificationPermission, isNotificationSupported, requestNotificationPermission } from "@/lib/notifications/notify";

export function AlarmManager() {
  const { timetable } = useData();
  const [isRinging, setIsRinging] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const ruleRef = useRef<Set<string>>(new Set()); // dedupe key: `${date}_${time}_${itemId}`
  const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const supported = await isNotificationSupported();
      if (!supported) return;
      const granted = await hasNotificationPermission();
      if (!granted) await requestNotificationPermission();
    })();

    const check = () => {
      if (isRinging) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const todayKey = now.toISOString().slice(0, 10);
      const todayDow = now.getDay();

      for (const item of timetable) {
        if (!item.enabled || item.startTime24 !== currentTime) continue;
        if (item.days.length > 0 && !item.days.includes(todayDow)) continue;
        const dedupeKey = `${todayKey}_${currentTime}_${item.id}`;
        if (ruleRef.current.has(dedupeKey)) continue;
        ruleRef.current.add(dedupeKey);
        trigger(item.task);
      }
    };

    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timetable, isRinging]);

  const trigger = (task: string) => {
    setCurrentTask(task);
    setIsRinging(true);
    fireNotification("⏰ समय हो गया है!", task).catch(() => {});
    try {
      beepOnce();
      beepIntervalRef.current = setInterval(() => beepOnce(), 1000);
    } catch (e) {
      console.error("Alarm sound error", e);
    }
    autoStopRef.current = setTimeout(() => stop(), 30000);
  };

  const stop = () => {
    setIsRinging(false);
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
  };

  return (
    <AnimatePresence>
      {isRinging && (
        <div className="fixed inset-0 z-[60000] flex items-center justify-center bg-black/70 p-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-3xl border-4 border-primary bg-card p-8 text-center"
          >
            <BellRing className="mx-auto mb-4 h-16 w-16 animate-bounce text-primary" />
            <h2 className="mb-2 text-2xl font-bold">समय हो गया है!</h2>
            <p className="mb-8 text-lg font-semibold text-primary">{currentTask}</p>
            <button
              onClick={stop}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive py-4 text-lg font-bold text-destructive-foreground touch-tap"
            >
              <XCircle /> अलार्म बंद करें
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
