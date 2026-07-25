import { supabase } from "./supabaseClient";

export interface TopicContent {
  topicId: string;
  keyPoints: string[];
  detailedContent?: string;
  updatedAt?: string;
}

/**
 * Supabase ke "topic_content" table se saare topics ka important-points +
 * detailed (Gemini-generated) content ek hi baar me fetch karta hai
 * (poori app ke liye ek call). Table schema: supabase_schema.sql dekho.
 */
export async function fetchAllTopicContent(): Promise<Record<string, TopicContent>> {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("topic_content")
    .select("topic_id, key_points, detailed_content, updated_at");

  if (error) {
    console.error("[topicContent] fetch fail:", error.message);
    return {};
  }

  const map: Record<string, TopicContent> = {};
  for (const row of data ?? []) {
    map[row.topic_id as string] = {
      topicId: row.topic_id as string,
      keyPoints: Array.isArray(row.key_points) ? (row.key_points as string[]) : [],
      detailedContent: (row.detailed_content as string | null) ?? undefined,
      updatedAt: row.updated_at as string | undefined,
    };
  }
  return map;
}
