import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  FlaskConical,
  Landmark,
  Globe2,
  Scale,
  TrendingUp,
  Brain,
  BookOpen,
  Languages,
  Monitor,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { SYLLABUS } from "@/lib/syllabus/syllabusData";
import { StudyTopicCard } from "@/components/StudyTopicCard";

const ICONS: Record<string, any> = {
  FlaskConical, Landmark, Globe2, Scale, TrendingUp, Brain,
  BookOpen, Languages, Monitor, Newspaper, Sparkles,
};

/**
 * "अध्ययन सामग्री" (Study) page — Syllabus.tsx jaisa hi structure
 * (Subject -> Unit -> Topic accordion), lekin ismein sirf study
 * material dikhta hai — koi progress %, complete-checkbox, MCQ ya
 * tracker feature nahi. Bottom-nav ke naye 5th tab se khulta hai.
 */
export function StudyMaterial() {
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [openUnit, setOpenUnit] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {SYLLABUS.map((subject, i) => {
        const totalTopics = subject.units.reduce((n, u) => n + u.topics.length, 0);
        const Icon = ICONS[subject.icon] ?? BookOpen;
        const tone = subject.color === "accent" ? "var(--color-accent)" : "var(--color-primary)";
        const isOpen = openSubject === subject.id;

        return (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card-surface overflow-hidden"
          >
            <button
              type="button"
              onClick={() => {
                setOpenSubject(isOpen ? null : subject.id);
                setOpenUnit(null);
              }}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 p-3 text-left touch-tap"
            >
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${tone} 15%, transparent)`, color: tone }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold">{subject.name}</h3>
                <p className="truncate text-xs text-muted-foreground">
                  {subject.hindiName} • {totalTopics} टॉपिक
                </p>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-muted-foreground">
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 border-t border-border/60 bg-muted/30 p-3">
                    {subject.units.map((unit) => {
                      const uOpen = openUnit === unit.id;
                      return (
                        <div key={unit.id} className="overflow-hidden rounded-xl border border-border/50 bg-card">
                          <button
                            type="button"
                            onClick={() => setOpenUnit(uOpen ? null : unit.id)}
                            aria-expanded={uOpen}
                            className="flex w-full items-center gap-2 p-2.5 text-left touch-tap"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-semibold">{unit.title}</div>
                              <div className="text-[11px] text-muted-foreground">{unit.topics.length} टॉपिक</div>
                            </div>
                            <motion.div animate={{ rotate: uOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-muted-foreground">
                              <ChevronDown className="h-4 w-4" />
                            </motion.div>
                          </button>
                          <AnimatePresence initial={false}>
                            {uOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-2 border-t border-border/50 p-2.5">
                                  {unit.topics.map((topic) => (
                                    <StudyTopicCard key={topic.id} topic={topic} />
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
