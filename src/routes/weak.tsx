import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/weak")({
  head: () => ({ meta: [{ title: "कमजोर विषय" }, { name: "description", content: "कठिन चिह्नित टॉपिक्स।" }] }),
  component: WeakPage,
});

function WeakPage() {
  const { topicStates } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const items = all.filter(({ topic }) => topicStates[topic.id]?.difficulty === "कठिन");

  return (
    <AppShell title="कमजोर विषय" subtitle={`${items.length} कठिन टॉपिक्स`} back>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">अभी कोई कठिन टॉपिक चिह्नित नहीं है।</p>
        ) : items.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
