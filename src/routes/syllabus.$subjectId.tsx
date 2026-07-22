import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { findSubject, type Subject } from "@/lib/syllabus/syllabusData";
import { useData } from "@/lib/db/DataContext";

export const Route = createFileRoute("/syllabus/$subjectId")({
  loader: ({ params }) => {
    const subject = findSubject(params.subjectId);
    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.subject.name} — पाठ्यक्रम` : "यूनिट्स" },
      { name: "description", content: loaderData ? `${loaderData.subject.hindiName} की सभी यूनिट व टॉपिक।` : "" },
    ],
  }),
  component: SubjectPage,
  notFoundComponent: () => <AppShell title="विषय नहीं मिला" back>यह विषय उपलब्ध नहीं है।</AppShell>,
});

function SubjectPage() {
  const { subject } = Route.useLoaderData() as { subject: Subject };
  const { topicStates } = useData();

  return (
    <AppShell title={subject.name} subtitle={subject.hindiName} back>
      <div className="space-y-3">
        {subject.units.map((unit, i) => {
          const done = unit.topics.filter(t => topicStates[t.id]?.isCompleted).length;
          const total = unit.topics.length;
          const pct = total ? Math.round((done/total)*100) : 0;
          return (
            <motion.div key={unit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link
                to="/syllabus/$subjectId/$unitId"
                params={{ subjectId: subject.id, unitId: unit.id }}
                className="card-surface flex items-center gap-3 p-3"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-bold">{unit.title}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{done}/{total}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
