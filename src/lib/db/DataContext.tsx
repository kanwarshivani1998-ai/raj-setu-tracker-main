import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_SETTINGS,
  clearAll,
  exportAll,
  importAll,
  loadAll,
  putDailyLog,
  putSettings,
  putStreak,
  putTopicState,
  putTimetableItem,
  deleteTimetableItem,
  putReminder,
  deleteReminder,
  type DailyLogEntry,
  type Settings,
  type StreakState,
  type TopicState,
  type TimetableItem,
  type PersonalReminder,
} from "./db";
import type { Difficulty } from "@/lib/syllabus/syllabusData";
import { scheduleDailyReminder, cancelDailyReminder } from "@/lib/notifications/scheduler";

interface DataContextValue {
  ready: boolean;
  topicStates: Record<string, TopicState>;
  settings: Settings;
  dailyLog: DailyLogEntry[];
  streak: StreakState;
  timetable: TimetableItem[];
  personalReminders: PersonalReminder[];
  updateTopic: (topicId: string, patch: Partial<TopicState>) => Promise<TopicState>;
  toggleComplete: (topicId: string, estimatedMinutes: number) => Promise<boolean>;
  toggleBookmark: (topicId: string) => Promise<void>;
  toggleRevision: (topicId: string) => Promise<void>;
  setDifficulty: (topicId: string, difficulty: Difficulty) => Promise<void>;
  setNotes: (topicId: string, notes: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  resetAll: () => Promise<void>;
  exportJSON: () => Promise<string>;
  importJSON: (text: string) => Promise<void>;
  addTimetableItem: (item: Omit<TimetableItem, "id">) => Promise<void>;
  updateTimetableItem: (item: TimetableItem) => Promise<void>;
  removeTimetableItem: (id: string) => Promise<void>;
  addReminder: (text: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
}

const Ctx = createContext<DataContextValue | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [topicStates, setTopicStates] = useState<Record<string, TopicState>>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [dailyLog, setDailyLog] = useState<DailyLogEntry[]>([]);
  const [streak, setStreak] = useState<StreakState>({ key: "streak", current: 0, longest: 0 });
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [personalReminders, setPersonalReminders] = useState<PersonalReminder[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAll();
        if (cancelled) return;
        const map: Record<string, TopicState> = {};
        for (const s of data.topicStates) map[s.topicId] = s;
        setTopicStates(map);
        setSettings(data.settings);
        setDailyLog(data.dailyLog);
        setStreak(data.streak);
        setTimetable(data.timetable);
        setPersonalReminders(data.personalReminders);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Apply theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const apply = () => {
      const t = settings.theme;
      const isDark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", isDark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  // Schedule / reschedule the daily study reminder whenever the setting changes
  useEffect(() => {
    if (!ready) return;
    if (settings.notificationsEnabled) {
      scheduleDailyReminder(settings);
    } else {
      cancelDailyReminder();
    }
  }, [ready, settings.notificationsEnabled, settings.notificationTime]);

  const persistTopic = useCallback(async (state: TopicState) => {
    await putTopicState(state);
    setTopicStates((prev) => ({ ...prev, [state.topicId]: state }));
    return state;
  }, []);

  const updateTopic = useCallback(async (topicId: string, patch: Partial<TopicState>) => {
    const prev = topicStates[topicId] ?? { topicId, isCompleted: false };
    const next: TopicState = { ...prev, ...patch, topicId, lastStudied: Date.now() };
    return persistTopic(next);
  }, [topicStates, persistTopic]);

  const bumpStreak = useCallback(async () => {
    const today = todayStr();
    if (streak.lastActiveDate === today) return;
    const nextCurrent = streak.lastActiveDate === yesterdayStr() ? streak.current + 1 : 1;
    const next: StreakState = {
      key: "streak",
      current: nextCurrent,
      longest: Math.max(streak.longest, nextCurrent),
      lastActiveDate: today,
    };
    await putStreak(next);
    setStreak(next);
  }, [streak]);

  const logDaily = useCallback(async (topicId: string, minutes: number, completed: boolean) => {
    const date = todayStr();
    const existing = dailyLog.find((d) => d.date === date) ?? { date, completedTopicIds: [], minutes: 0 };
    const ids = new Set(existing.completedTopicIds);
    if (completed) ids.add(topicId); else ids.delete(topicId);
    const next: DailyLogEntry = {
      date,
      completedTopicIds: Array.from(ids),
      minutes: Math.max(0, existing.minutes + (completed ? minutes : -minutes)),
    };
    await putDailyLog(next);
    setDailyLog((prev) => {
      const others = prev.filter((d) => d.date !== date);
      return [...others, next];
    });
  }, [dailyLog]);

  const toggleComplete = useCallback(async (topicId: string, estimatedMinutes: number) => {
    const prev = topicStates[topicId] ?? { topicId, isCompleted: false };
    const willComplete = !prev.isCompleted;
    const next: TopicState = {
      ...prev,
      topicId,
      isCompleted: willComplete,
      completedAt: willComplete ? Date.now() : undefined,
      lastStudied: Date.now(),
    };
    await persistTopic(next);
    await logDaily(topicId, estimatedMinutes, willComplete);
    if (willComplete) await bumpStreak();
    return willComplete;
  }, [topicStates, persistTopic, logDaily, bumpStreak]);

  const toggleBookmark = useCallback(async (topicId: string) => {
    const prev = topicStates[topicId] ?? { topicId, isCompleted: false };
    await persistTopic({ ...prev, bookmarked: !prev.bookmarked, lastStudied: Date.now() });
  }, [topicStates, persistTopic]);

  const toggleRevision = useCallback(async (topicId: string) => {
    const prev = topicStates[topicId] ?? { topicId, isCompleted: false };
    await persistTopic({ ...prev, markedForRevision: !prev.markedForRevision, lastStudied: Date.now() });
  }, [topicStates, persistTopic]);

  const setDifficulty = useCallback(async (topicId: string, difficulty: Difficulty) => {
    const prev = topicStates[topicId] ?? { topicId, isCompleted: false };
    await persistTopic({ ...prev, difficulty, lastStudied: Date.now() });
  }, [topicStates, persistTopic]);

  const setNotes = useCallback(async (topicId: string, notes: string) => {
    const prev = topicStates[topicId] ?? { topicId, isCompleted: false };
    await persistTopic({ ...prev, notes, lastStudied: Date.now() });
  }, [topicStates, persistTopic]);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const next: Settings = { ...settings, ...patch, key: "settings" };
    await putSettings(next);
    setSettings(next);
  }, [settings]);

  const resetAll = useCallback(async () => {
    await clearAll();
    setTopicStates({});
    setSettings(DEFAULT_SETTINGS);
    setDailyLog([]);
    setStreak({ key: "streak", current: 0, longest: 0 });
    setTimetable([]);
    setPersonalReminders([]);
  }, []);

  const exportJSON = useCallback(async () => {
    const data = await exportAll();
    return JSON.stringify(data, null, 2);
  }, []);

  const importJSON = useCallback(async (text: string) => {
    const data = JSON.parse(text);
    await importAll(data);
    const fresh = await loadAll();
    const map: Record<string, TopicState> = {};
    for (const s of fresh.topicStates) map[s.topicId] = s;
    setTopicStates(map);
    setSettings(fresh.settings);
    setDailyLog(fresh.dailyLog);
    setStreak(fresh.streak);
    setTimetable(fresh.timetable);
    setPersonalReminders(fresh.personalReminders);
  }, []);

  const addTimetableItem = useCallback(async (item: Omit<TimetableItem, "id">) => {
    const full: TimetableItem = { ...item, id: crypto.randomUUID() };
    await putTimetableItem(full);
    setTimetable((prev) => [...prev, full]);
  }, []);

  const updateTimetableItem = useCallback(async (item: TimetableItem) => {
    await putTimetableItem(item);
    setTimetable((prev) => prev.map((t) => (t.id === item.id ? item : t)));
  }, []);

  const removeTimetableItem = useCallback(async (id: string) => {
    await deleteTimetableItem(id);
    setTimetable((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addReminder = useCallback(async (text: string) => {
    const item: PersonalReminder = { id: crypto.randomUUID(), text, isCompleted: false, createdAt: Date.now() };
    await putReminder(item);
    setPersonalReminders((prev) => [item, ...prev]);
  }, []);

  const toggleReminder = useCallback(async (id: string) => {
    setPersonalReminders((prev) => {
      const item = prev.find((r) => r.id === id);
      if (!item) return prev;
      const next = { ...item, isCompleted: !item.isCompleted };
      putReminder(next);
      return prev.map((r) => (r.id === id ? next : r));
    });
  }, []);

  const removeReminder = useCallback(async (id: string) => {
    await deleteReminder(id);
    setPersonalReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo<DataContextValue>(() => ({
    ready, topicStates, settings, dailyLog, streak, timetable, personalReminders,
    updateTopic, toggleComplete, toggleBookmark, toggleRevision,
    setDifficulty, setNotes, updateSettings, resetAll, exportJSON, importJSON,
    addTimetableItem, updateTimetableItem, removeTimetableItem,
    addReminder, toggleReminder, removeReminder,
  }), [ready, topicStates, settings, dailyLog, streak, timetable, personalReminders,
       updateTopic, toggleComplete, toggleBookmark, toggleRevision,
       setDifficulty, setNotes, updateSettings, resetAll, exportJSON, importJSON,
       addTimetableItem, updateTimetableItem, removeTimetableItem,
       addReminder, toggleReminder, removeReminder]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData must be used inside DataProvider");
  return v;
}
