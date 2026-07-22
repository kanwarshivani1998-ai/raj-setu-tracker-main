import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "खोजें — Rajasthan CET Tracker" }, { name: "description", content: "विषय, यूनिट, टॉपिक व कीवर्ड से खोजें।" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const all = useMemo(() => getAllTopics(), []);
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return all.filter(({ subject, unit, topic }) =>
      subject.name.toLowerCase().includes(query) ||
      subject.hindiName.includes(query) ||
      unit.title.toLowerCase().includes(query) ||
      topic.title.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [q, all]);

  return (
    <AppShell title="खोजें" subtitle="विषय, यूनिट, टॉपिक या कीवर्ड">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="यहाँ लिखें… जैसे History, संविधान"
          className="w-full rounded-xl border border-input bg-card py-3 pl-9 pr-10 text-sm outline-none focus:border-primary"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground touch-tap">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {q && results.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">कोई परिणाम नहीं मिला।</p>
        )}
        {!q && (
          <p className="py-8 text-center text-sm text-muted-foreground">खोजने के लिए कुछ लिखें।</p>
        )}
        {results.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
