import { supabase } from "@/lib/content/supabaseClient";
import {
  type CachedMCQQuestion,
  getMCQSyncMeta,
  putCachedMCQBulk,
  setMCQSyncMeta,
} from "@/lib/db/db";

// Ek dafa me Supabase se kitni rows maangni hain (Postgres/Supabase ki default row-limit se bachne ke liye)
const PAGE_SIZE = 1000;

interface RawMCQRow {
  id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation?: string;
}

let syncInFlight: Promise<void> | null = null;

/**
 * App start hote hi (agar internet available hai aur pehle kabhi poora sync nahi hua)
 * Supabase ke "mcq_questions" table ka SAARA data ek baar download karke IndexedDB
 * (phone) me store kar deta hai. Uske baad MCQTest component Supabase ko baar baar
 * call nahi karta — seedha local cache se questions padhta hai, chahe internet ho ya na ho.
 *
 * @param force true pass karo to already-synced hone par bhi dobara poora data khींch le
 *              (jaise Settings me "Sync Now" button dabane par).
 */
export async function syncAllMCQFromSupabase(force = false): Promise<{ skipped: boolean; count: number }> {
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
    const meta = await getMCQSyncMeta();
    if (meta?.lastFullSyncAt) {
      return { skipped: true, count: meta.totalQuestions ?? 0 }; // Pehle hi ek baar poora download ho chuka hai
    }
  }

  const run = (async () => {
    const byTopic: Record<string, CachedMCQQuestion[]> = {};
    let from = 0;
    let totalCount = 0;

    // Paginate karke saare rows khींचो — 1000+ questions honge to ek hi call kaafi nahi hogi
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await supabase!
        .from("mcq_questions")
        .select("id, topic_id, question_text, options, correct_option, explanation")
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.warn("[mcqSync] Supabase se MCQ data laane me error:", error.message);
        break;
      }
      const rows = (data ?? []) as RawMCQRow[];
      if (rows.length === 0) break;

      for (const row of rows) {
        if (!byTopic[row.topic_id]) byTopic[row.topic_id] = [];
        byTopic[row.topic_id].push({
          id: row.id,
          question_text: row.question_text,
          options: row.options,
          correct_option: row.correct_option,
          explanation: row.explanation,
        });
        totalCount++;
      }

      if (rows.length < PAGE_SIZE) break; // Aakhri page mil gaya
      from += PAGE_SIZE;
    }

    if (totalCount > 0) {
      await putCachedMCQBulk(byTopic);
      await setMCQSyncMeta({
        lastFullSyncAt: Date.now(),
        totalTopics: Object.keys(byTopic).length,
        totalQuestions: totalCount,
      });
    }
  })();

  syncInFlight = run;
  try {
    await run;
  } finally {
    syncInFlight = null;
  }

  return { skipped: false, count: 0 };
}
