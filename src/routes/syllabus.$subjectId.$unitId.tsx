import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { findSubject, findUnit, type Subject, type Unit } from "@/lib/syllabus/syllabusData";
import { useData } from "@/lib/db/DataContext";

export const Route = createFileRoute("/syllabus/$subjectId/$unitId")({
  loader: ({ params }) => {
    const subject = findSubject(params.subjectId);
    const unit = findUnit(params.subjectId, params.unitId);
    if (!subject || !unit) throw notFound();
    return { subject, unit };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.unit.title} — ${loaderData.subject.name}` : "टॉपिक्स" },
      { name: "description", content: loaderData ? `${loaderData.unit.title} के अंतर्गत सभी टॉपिक्स।` : "" },
    ],
  }),
  component: UnitPage,
  notFoundComponent: () => <AppShell title="यूनिट नहीं मिली" back>यह यूनिट उपलब्ध नहीं है।</AppShell>,
});

function UnitPage() {
  const { subject, unit } = Route.useLoaderData() as { subject: Subject; unit: Unit };
  const { topicStates } = useData();
  const done = unit.topics.filter(t => topicStates[t.id]?.isCompleted).length;
  const total = unit.topics.length;

  return (
    <AppShell title={unit.title} subtitle={`${subject.name} • ${done}/${total} पूर्ण`} back>
      <div className="space-y-2.5">
        {unit.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </AppShell>
  );
}
