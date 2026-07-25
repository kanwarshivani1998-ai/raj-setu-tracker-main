import { openDB, type IDBPDatabase } from "idb";
import type { Difficulty } from "@/lib/syllabus/syllabusData";

export interface TopicState {
  topicId: string;
  isCompleted: boolean;
  difficulty?: Difficulty;
  notes?: string;
  bookmarked?: boolean;
  markedForRevision?: boolean;
  lastStudied?: number; // epoch ms
  completedAt?: number;
}

export interface Settings {
  key: "settings";
  dailyTargetTopics: number;
  dailyTargetMinutes: number;
  notificationTime: string; // "09:00"
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  examDate?: string; // ISO date
  audioUnlocked?: boolean; // Welcome Screen gate
  lastMotivationShownDate?: string; // YYYY-MM-DD, once-per-day gate
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  completedTopicIds: string[];
  minutes: number;
}

export interface StreakState {
  key: "streak";
  current: number;
  longest: number;
  lastActiveDate?: string;
}

// User-editable daily timetable entry (drives the alarm system)
export interface TimetableItem {
  id: string;
  task: string;
  startTime24: string; // "HH:MM"
  days: number[]; // 0=Sun..6=Sat; empty array = every day
  enabled: boolean;
}

// Quick doubts / sticky-note reminders (separate from per-topic notes)
export interface PersonalReminder {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: number;
}

const DB_NAME = "rajasthan-cet-tracker";
const DB_VERSION = 4; // bumped from 3 — adds topicContentCache + topicContentSyncMeta stores (offline study content download)

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB not available on server"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("topicState")) {
          db.createObjectStore("topicState", { keyPath: "topicId" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("dailyLog")) {
          db.createObjectStore("dailyLog", { keyPath: "date" });
        }
        if (!db.objectStoreNames.contains("streak")) {
          db.createObjectStore("streak", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("timetable")) {
          db.createObjectStore("timetable", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("personalReminders")) {
          db.createObjectStore("personalReminders", { keyPath: "id" });
        }
        // MCQ questions ka local cache — topic_id ke hisab se, ek baar Supabase se sync ho jaane ke baad
        // baar baar internet call karne ki zaroorat nahi padti.
        if (!db.objectStoreNames.contains("mcqCache")) {
          db.createObjectStore("mcqCache", { keyPath: "topicId" });
        }
        if (!db.objectStoreNames.contains("mcqSyncMeta")) {
          db.createObjectStore("mcqSyncMeta", { keyPath: "key" });
        }
        // Study content (key points + detailed article) ka local cache — topic_id ke hisab se,
        // ek baar Supabase se sync ho jaane ke baad offline hone par bhi dikhta rahe.
        if (!db.objectStoreNames.contains("topicContentCache")) {
          db.createObjectStore("topicContentCache", { keyPath: "topicId" });
        }
        if (!db.objectStoreNames.contains("topicContentSyncMeta")) {
          db.createObjectStore("topicContentSyncMeta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

// ---------- MCQ offline cache helpers ----------

export interface CachedMCQQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation?: string;
}

interface MCQTopicCacheRow {
  topicId: string;
  questions: CachedMCQQuestion[];
  syncedAt: number;
}

export interface MCQSyncMeta {
  key: "mcqSync";
  lastFullSyncAt?: number; // epoch ms — jab poora Supabase data ek baar download ho gaya
  totalTopics?: number;
  totalQuestions?: number;
}

export async function getCachedMCQ(topicId: string): Promise<CachedMCQQuestion[] | undefined> {
  const db = await getDB();
  const row = (await db.get("mcqCache", topicId)) as MCQTopicCacheRow | undefined;
  return row?.questions;
}

export async function putCachedMCQ(topicId: string, questions: CachedMCQQuestion[]) {
  const db = await getDB();
  const row: MCQTopicCacheRow = { topicId, questions, syncedAt: Date.now() };
  await db.put("mcqCache", row);
}

export async function putCachedMCQBulk(byTopic: Record<string, CachedMCQQuestion[]>) {
  const db = await getDB();
  const tx = db.transaction("mcqCache", "readwrite");
  const now = Date.now();
  await Promise.all(
    Object.entries(byTopic).map(([topicId, questions]) =>
      tx.objectStore("mcqCache").put({ topicId, questions, syncedAt: now } as MCQTopicCacheRow)
    )
  );
  await tx.done;
}

export async function getMCQSyncMeta(): Promise<MCQSyncMeta | undefined> {
  const db = await getDB();
  return (await db.get("mcqSyncMeta", "mcqSync")) as MCQSyncMeta | undefined;
}

export async function setMCQSyncMeta(meta: Omit<MCQSyncMeta, "key">) {
  const db = await getDB();
  await db.put("mcqSyncMeta", { key: "mcqSync", ...meta } as MCQSyncMeta);
}

// ---------- Study content (key points + detailed article) offline cache helpers ----------

export interface CachedTopicContent {
  topicId: string;
  keyPoints: string[];
  detailedContent?: string;
  updatedAt?: string;
}

export interface TopicContentSyncMeta {
  key: "topicContentSync";
  lastFullSyncAt?: number; // epoch ms — jab poora Supabase data ek baar download ho gaya
  totalTopics?: number;
}

export async function getAllCachedTopicContent(): Promise<Record<string, CachedTopicContent>> {
  const db = await getDB();
  const rows = (await db.getAll("topicContentCache")) as CachedTopicContent[];
  const map: Record<string, CachedTopicContent> = {};
  for (const row of rows) map[row.topicId] = row;
  return map;
}

export async function putCachedTopicContentBulk(byTopic: Record<string, CachedTopicContent>) {
  const db = await getDB();
  const tx = db.transaction("topicContentCache", "readwrite");
  await Promise.all(
    Object.values(byTopic).map((row) => tx.objectStore("topicContentCache").put(row))
  );
  await tx.done;
}

export async function getTopicContentSyncMeta(): Promise<TopicContentSyncMeta | undefined> {
  const db = await getDB();
  return (await db.get("topicContentSyncMeta", "topicContentSync")) as TopicContentSyncMeta | undefined;
}

export async function setTopicContentSyncMeta(meta: Omit<TopicContentSyncMeta, "key">) {
  const db = await getDB();
  await db.put("topicContentSyncMeta", { key: "topicContentSync", ...meta } as TopicContentSyncMeta);
}

export const DEFAULT_SETTINGS: Settings = {
  key: "settings",
  dailyTargetTopics: 3,
  dailyTargetMinutes: 120,
  notificationTime: "09:00",
  notificationsEnabled: false,
  theme: "system",
  examDate: undefined,
  audioUnlocked: false,
  lastMotivationShownDate: undefined,
};

export async function loadAll() {
  const db = await getDB();
  const [topicStates, settingsRow, dailyLog, streakRow, timetable, personalReminders] = await Promise.all([
    db.getAll("topicState") as Promise<TopicState[]>,
    db.get("settings", "settings") as Promise<Settings | undefined>,
    db.getAll("dailyLog") as Promise<DailyLogEntry[]>,
    db.get("streak", "streak") as Promise<StreakState | undefined>,
    db.getAll("timetable") as Promise<TimetableItem[]>,
    db.getAll("personalReminders") as Promise<PersonalReminder[]>,
  ]);
  return {
    topicStates,
    settings: settingsRow ?? DEFAULT_SETTINGS,
    dailyLog,
    streak: streakRow ?? { key: "streak" as const, current: 0, longest: 0 },
    timetable,
    personalReminders,
  };
}

export async function putTopicState(state: TopicState) {
  const db = await getDB();
  await db.put("topicState", state);
}

export async function putSettings(settings: Settings) {
  const db = await getDB();
  await db.put("settings", settings);
}

export async function putStreak(streak: StreakState) {
  const db = await getDB();
  await db.put("streak", streak);
}

export async function putDailyLog(entry: DailyLogEntry) {
  const db = await getDB();
  await db.put("dailyLog", entry);
}

export async function putTimetableItem(item: TimetableItem) {
  const db = await getDB();
  await db.put("timetable", item);
}

export async function deleteTimetableItem(id: string) {
  const db = await getDB();
  await db.delete("timetable", id);
}

export async function putReminder(item: PersonalReminder) {
  const db = await getDB();
  await db.put("personalReminders", item);
}

export async function deleteReminder(id: string) {
  const db = await getDB();
  await db.delete("personalReminders", id);
}

export async function clearAll() {
  const db = await getDB();
  await Promise.all([
    db.clear("topicState"),
    db.clear("settings"),
    db.clear("dailyLog"),
    db.clear("streak"),
    db.clear("timetable"),
    db.clear("personalReminders"),
    db.clear("mcqCache"),
    db.clear("mcqSyncMeta"),
    db.clear("topicContentCache"),
    db.clear("topicContentSyncMeta"),
  ]);
}

export async function exportAll() {
  const data = await loadAll();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export async function importAll(data: Awaited<ReturnType<typeof exportAll>>) {
  await clearAll();
  const db = await getDB();
  const stores = ["topicState", "settings", "dailyLog", "streak", "timetable", "personalReminders"] as const;
  const tx = db.transaction(stores, "readwrite");
  await Promise.all([
    ...data.topicStates.map((t) => tx.objectStore("topicState").put(t)),
    tx.objectStore("settings").put(data.settings),
    ...data.dailyLog.map((d) => tx.objectStore("dailyLog").put(d)),
    tx.objectStore("streak").put(data.streak),
    ...(data.timetable ?? []).map((t) => tx.objectStore("timetable").put(t)),
    ...(data.personalReminders ?? []).map((r) => tx.objectStore("personalReminders").put(r)),
  ]);
  await tx.done;
}
