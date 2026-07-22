import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { findSubject, findUnit, type Subject, type Unit } from "@/lib/syllabus/syllabusData";
import { useData } from "@/lib/db/DataContext";
import MCQTest from "@/components/MCQTest"; // MCQ Test Component Import kiya
import { useState } from "react";

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

  // Tabs state: 'topics' ya 'test'
  const [activeTab, setActiveTab] = useState<"topics" | "test">("topics");

  return (
    <AppShell title={unit.title} subtitle={`${subject.name} • ${done}/${total} पूर्ण`} back>
      
      {/* 1. Toggle Tabs: Topics vs MCQ Test */}
      <div className="flex border-b border-gray-200 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("topics")}
          className={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all ${
            activeTab === "topics"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📖 सिलेबस टॉपिक्स ({total})
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all ${
            activeTab === "test"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📝 MCQ प्रैक्टिस टेस्ट
        </button>
      </div>

      {/* 2. Tab 1: Topics List (Aapka purana code) */}
      {activeTab === "topics" && (
        <div className="space-y-2.5">
          {unit.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}

      {/* 3. Tab 2: MCQ Test Component */}
      {activeTab === "test" && (
        <div className="mt-2">
          {/* unit.id Supabase mein search karne ke liye pass ho raha hai */}
          <MCQTest topicId={unit.id} />
        </div>
      )}

    </AppShell>
  );
}
