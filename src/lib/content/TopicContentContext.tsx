import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchAllTopicContent, type TopicContent } from "./topicContent";
import { syncAllTopicContentFromSupabase } from "./topicContentSync";
import { getAllCachedTopicContent } from "@/lib/db/db";

interface TopicContentContextValue {
  content: Record<string, TopicContent>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const TopicContentContext = createContext<TopicContentContextValue | null>(null);

/** IndexedDB cache se content padh kar TopicContent shape me convert karta hai. */
async function loadFromCache(): Promise<Record<string, TopicContent>> {
  const cached = await getAllCachedTopicContent();
  const map: Record<string, TopicContent> = {};
  for (const [topicId, row] of Object.entries(cached)) {
    map[topicId] = {
      topicId,
      keyPoints: row.keyPoints ?? [],
      detailedContent: row.detailedContent,
      updatedAt: row.updatedAt,
    };
  }
  return map;
}

export function TopicContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, TopicContent>>({});
  const [loading, setLoading] = useState(true);

  /**
   * Pehle IndexedDB (phone) ke cache se turant padh lo — internet ho ya na ho,
   * content turant dikh jaata hai. Uske baad, agar internet hai, background me
   * Supabase se fresh data sync karke cache + UI dono update kar do (MCQ wale
   * hi pattern se).
   */
  const refresh = async () => {
    setLoading(true);

    const cachedMap = await loadFromCache();
    if (Object.keys(cachedMap).length > 0) {
      setContent(cachedMap);
      setLoading(false);
    }

    // Force sync — jab user manually refresh kare (jaise Settings ke "Sync Now" se)
    const result = await syncAllTopicContentFromSupabase(true);
    if (!result.skipped) {
      const freshMap = await loadFromCache();
      setContent(freshMap);
    } else if (Object.keys(cachedMap).length === 0) {
      // Na cache mila na sync hua (jaise Supabase configure hi nahi) — direct fetch try karo
      const map = await fetchAllTopicContent();
      setContent(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) Pehle cache se turant dikhao — offline hone par bhi content khali nahi rahega.
      const cachedMap = await loadFromCache();
      if (Object.keys(cachedMap).length > 0) {
        setContent(cachedMap);
        setLoading(false);
      }

      // 2) Background me ek-baar-poora sync (agar pehle kabhi nahi hua aur internet hai).
      const result = await syncAllTopicContentFromSupabase(false);
      if (!result.skipped) {
        const freshMap = await loadFromCache();
        setContent(freshMap);
      } else if (Object.keys(cachedMap).length === 0) {
        // Cache bhi khali hai aur sync bhi skip hua (jaise Supabase hi configure nahi) —
        // seedha online fetch try karo taaki purani behavior bani rahe.
        const map = await fetchAllTopicContent();
        setContent(map);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TopicContentContext.Provider value={{ content, loading, refresh }}>
      {children}
    </TopicContentContext.Provider>
  );
}

/** Ek topic ke important points uthane ke liye (TopicCard me use hota hai). */
export function useTopicContent(topicId: string): TopicContent | undefined {
  const ctx = useContext(TopicContentContext);
  if (!ctx) throw new Error("useTopicContent, TopicContentProvider ke andar hona chahiye.");
  return ctx.content[topicId];
}

/** Poora content map + loading state + manual refresh chahiye ho to. */
export function useTopicContentAll() {
  const ctx = useContext(TopicContentContext);
  if (!ctx) throw new Error("useTopicContentAll, TopicContentProvider ke andar hona chahiye.");
  return ctx;
}
