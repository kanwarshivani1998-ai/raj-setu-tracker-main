import { supabase } from "@/lib/content/supabaseClient";
import {
  type CachedTopicContent,
  getTopicContentSyncMeta,
  putCachedTopicContentBulk,
  setTopicContentSyncMeta,
} from "@/lib/db/db";

interface RawTopicContentRow {
  topic_id: string;
  key_points: string[];
  detailed_content?: string | null;
  updated_at?: string;
}

let syncInFlight: Promise<void> | null = null;

/**
 * App start hote hi (agar internet available hai aur pehle kabhi poora sync nahi hua)
 * Supabase ke "topic_content" table ka SAARA data (key points + detailed article) ek
 * baar download karke IndexedDB (phone) me store kar deta hai. Uske baad
 * TopicContentContext offline hone par bhi local cache se content padhta hai — MCQ
 * wale hi pattern se (dekho mcqSync.ts).
 *
 * @param force true pass karo to already-synced hone par bhi dobara poora data khींच le
 *              (jaise Settings me "Sync Now" button dabane par).
 */
export async function syncAllTopicContentFromSupabase(
  force = false
): Promise<{ skipped: boolean; count: number }> {
  // Ek time pe ek hi sync chale — agar already chal raha hai to usi promise ka wait karo
  if (syncInFlight) {
    await syncInFlight;
    return { skipped: true, count: 0 };
  }

  if (!supabase) {
    return { skipped: true, count: 0 }; // Supabase configure hi nahi hai
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { skipped: true, count: 0 }; // Internet nahi hai — abhi sync mat karo
  }

  if (!force) {
    const meta = await getTopicContentSyncMeta();
    if (meta?.lastFullSyncAt) {
      return { skipped: true, count: meta.totalTopics ?? 0 }; // Pehle hi ek baar poora download ho chuka hai
    }
  }

  const run = (async () => {
    const { data, error } = await supabase!
      .from("topic_content")
      .select("topic_id, key_points, detailed_content, updated_at");

    if (error) {
      console.warn("[topicContentSync] Supabase se content laane me error:", error.message);
      return;
    }

    const rows = (data ?? []) as RawTopicContentRow[];
    const byTopic: Record<string, CachedTopicContent> = {};
    for (const row of rows) {
      byTopic[row.topic_id] = {
        topicId: row.topic_id,
        keyPoints: Array.isArray(row.key_points) ? row.key_points : [],
        detailedContent: row.detailed_content ?? undefined,
        updatedAt: row.updated_at,
      };
    }

    if (rows.length > 0) {
      await putCachedTopicContentBulk(byTopic);
      await setTopicContentSyncMeta({
        lastFullSyncAt: Date.now(),
        totalTopics: rows.length,
      });
    }
  })();

  syncInFlight = run;
  try {
    await run;
  } finally {
    syncInFlight = null;
  }

  const meta = await getTopicContentSyncMeta();
  return { skipped: false, count: meta?.totalTopics ?? 0 };
}
