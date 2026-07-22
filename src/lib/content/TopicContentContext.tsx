import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchAllTopicContent, type TopicContent } from "./topicContent";

interface TopicContentContextValue {
  content: Record<string, TopicContent>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const TopicContentContext = createContext<TopicContentContextValue | null>(null);

export function TopicContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, TopicContent>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const map = await fetchAllTopicContent();
    setContent(map);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
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
