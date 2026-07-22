import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/revision")({
  head: () => ({ meta: [{ title: "रिवीजन" }, { name: "description", content: "रिवीजन के लिए चिह्नित टॉपिक्स।" }] }),
  component: RevisionPage,
});

function RevisionPage() {
  const { topicStates } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const items = all.filter(({ topic }) => topicStates[topic.id]?.markedForRevision);

  return (
    <AppShell title="रिवीजन" subtitle={`${items.length} टॉपिक्स बकाया`} back>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">कोई टॉपिक रिवीजन के लिए चिह्नित नहीं है।</p>
        ) : items.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
