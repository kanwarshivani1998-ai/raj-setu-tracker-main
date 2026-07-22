import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "नोट्स" }, { name: "description", content: "सभी उपयोगकर्ता नोट्स।" }] }),
  component: NotesPage,
});

function NotesPage() {
  const { topicStates } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const items = all.filter(({ topic }) => (topicStates[topic.id]?.notes ?? "").trim().length > 0);

  return (
    <AppShell title="नोट्स" subtitle={`${items.length} टॉपिक्स में नोट्स`} back>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">अभी कोई नोट्स नहीं हैं।</p>
        ) : items.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
