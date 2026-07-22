import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({ meta: [{ title: "बुकमार्क्स" }, { name: "description", content: "बुकमार्क किए गए टॉपिक्स।" }] }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const { topicStates } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const items = all.filter(({ topic }) => topicStates[topic.id]?.bookmarked);

  return (
    <AppShell title="बुकमार्क्स" subtitle={`${items.length} सहेजे गए`} back>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">अभी कोई बुकमार्क नहीं हैं।</p>
        ) : items.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
