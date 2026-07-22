import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/today")({
  head: () => ({ meta: [{ title: "आज का लक्ष्य" }, { name: "description", content: "आज के दिन पूर्ण करने योग्य टॉपिक्स।" }] }),
  component: TodayPage,
});

function TodayPage() {
  const { topicStates, settings } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const pending = all.filter(({ topic }) => !topicStates[topic.id]?.isCompleted).slice(0, Math.max(3, settings.dailyTargetTopics * 2));

  return (
    <AppShell title="आज का लक्ष्य" subtitle={`दैनिक लक्ष्य: ${settings.dailyTargetTopics} टॉपिक्स`} back>
      <div className="space-y-2.5">
        {pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">सभी टॉपिक्स पूर्ण हैं — बधाई हो!</p>
        ) : pending.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
