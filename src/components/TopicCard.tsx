import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Check, Clock, Repeat, StickyNote, ChevronDown, Sparkles, FileText, HelpCircle } from "lucide-react";
import { useData } from "@/lib/db/DataContext";
import { useTopicContent } from "@/lib/content/TopicContentContext";
import type { Topic, Difficulty } from "@/lib/syllabus/syllabusData";
import MCQTest from "@/components/MCQTest"; // MCQ Test Import

interface Props {
  topic: Topic;
  contextLabel?: string;
}

const DIFFICULTIES: Difficulty[] = ["आसान", "मध्यम", "कठिन"];
const DIFF_COLORS: Record<Difficulty, string> = {
  "आसान": "var(--color-easy)",
  "मध्यम": "var(--color-medium)",
  "कठिन": "var(--color-hard)",
};

export function TopicCard({ topic, contextLabel }: Props) {
  const { topicStates, toggleComplete, toggleBookmark, toggleRevision, setDifficulty, setNotes } = useData();
  const state = topicStates[topic.id];
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  
  // Tab control: 'content' (Notes/Keypoints) ya 'test' (MCQ Quiz)
  const [activeTab, setActiveTab] = useState<"content" | "test">("content");

  // Online (Supabase) se aaya hua "important points" content
  const onlineContent = useTopicContent(topic.id);

  const completed = !!state?.isCompleted;
  const notes = state?.notes ?? "";
  const bookmarked = !!state?.bookmarked;
  const forRevision = !!state?.markedForRevision;
  const diff = state?.difficulty;

  const handleToggle = async () => {
    const nowComplete = await toggleComplete(topic.id, topic.estimatedMinutes);
    if (nowComplete) {
      setBurst((n) => n + 1);
      toast.success("बधाई हो! यह टॉपिक पूरा हो गया है।");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface relative overflow-hidden p-3"
      style={completed ? {
        background: "color-mix(in oklab, var(--color-success) 14%, var(--color-card))",
        borderColor: "color-mix(in oklab, var(--color-success) 45%, var(--color-border))",
      } : undefined}
    >
      {/* Success burst */}
      <AnimatePresence>
        {burst > 0 && (
          <motion.div
            key={burst}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={() => setBurst(0)}
            className="pointer-events-none absolute -left-4 -top-4 h-16 w-16 rounded-full"
            style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--color-success) 40%, transparent), transparent 70%)" }}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleToggle}
          aria-label={completed ? "अपूर्ण चिह्नित करें" : "पूर्ण चिह्नित करें"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 touch-tap"
          style={{
            borderColor: completed ? "var(--color-success)" : "var(--color-border)",
            background: completed ? "var(--color-success)" : "transparent",
          }}
        >
          {completed && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
        </motion.button>

        <button onClick={() => setOpen((v) => !v)} className="min-w-0 text-left">
          {contextLabel && <div className="truncate text-[11px] font-medium text-muted-foreground">{contextLabel}</div>}
          <h3 className={`text-[15px] font-semibold leading-snug ${completed ? "line-through opacity-70" : ""}`}>
            {topic.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{topic.estimatedMinutes} मिनट</span>
            {diff && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: `color-mix(in oklab, ${DIFF_COLORS[diff]} 20%, transparent)`, color: DIFF_COLORS[diff] }}>
                {diff}
              </span>
            )}
            {forRevision && <span className="inline-flex items-center gap-1 text-accent"><Repeat className="h-3 w-3" />रिवीजन</span>}
            {onlineContent?.keyPoints?.length ? (
              <span className="inline-flex items-center gap-1 text-primary"><Sparkles className="h-3 w-3" />मुख्य बिंदु उपलब्ध</span>
            ) : null}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => toggleBookmark(topic.id)}
            aria-label="बुकमार्क"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground touch-tap"
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="विवरण"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground touch-tap"
          >
            <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-4 w-4" /></motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              
              {/* TOP TABS: Study Material vs MCQ Practice Test */}
              <div className="flex rounded-lg border border-border bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
                    activeTab === "content"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" /> अध्ययन सामग्री
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("test")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
                    activeTab === "test"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" /> MCQ टेस्ट (100 Qs)
                </button>
              </div>

              {/* TAB 1: STUDY MATERIAL (Pura Purana Code) */}
              {activeTab === "content" && (
                <div className="space-y-3">
                  {onlineContent?.keyPoints?.length ? (
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" /> मुख्य बिंदु
                      </label>
                      <ul className="space-y-1.5 rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
                        {onlineContent.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">कठिनाई स्तर</label>
                    <div className="flex gap-2">
                      {DIFFICULTIES.map((d) => {
                        const active = diff === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setDifficulty(topic.id, d)}
                            className="flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition touch-tap"
                            style={{
                              borderColor: active ? DIFF_COLORS[d] : "var(--color-border)",
                              background: active ? `color-mix(in oklab, ${DIFF_COLORS[d]} 18%, transparent)` : "transparent",
                              color: active ? DIFF_COLORS[d] : "var(--color-foreground)",
                            }}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <StickyNote className="h-3.5 w-3.5" /> नोट्स
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(topic.id, e.target.value)}
                      placeholder="यहाँ अपने नोट्स लिखें…"
                      rows={3}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => toggleRevision(topic.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-input py-2.5 text-sm font-semibold touch-tap"
                    style={forRevision ? { background: "color-mix(in oklab, var(--color-accent) 15%, transparent)", color: "var(--color-accent)", borderColor: "var(--color-accent)" } : undefined}
                  >
                    <Repeat className="h-4 w-4" />
                    {forRevision ? "रिवीजन सूची से हटाएँ" : "रिवीजन के लिए चिह्नित करें"}
                  </button>
                </div>
              )}

              {/* TAB 2: MCQ TEST COMPONENT */}
              {activeTab === "test" && (
                <div className="pt-1">
                  {/* Default fallback ID bhi added hai agar specific topic id na mile */}
                  <MCQTest topicId={topic.id || "b1fec999-9c0b-4ef8-bb6d-6bb9bd380a22"} />
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
