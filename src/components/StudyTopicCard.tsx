import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles, FileText } from "lucide-react";
import { useTopicContent } from "@/lib/content/TopicContentContext";
import type { Topic } from "@/lib/syllabus/syllabusData";

interface Props {
  topic: Topic;
}

/**
 * TopicCard jaisa hi dikhta hai, lekin sirf study/reading ke liye —
 * koi complete-checkbox, bookmark, MCQ tab, notes ya difficulty selector nahi.
 * Sirf topic title + mukhya bindu + detailed jankari (Gemini-generated).
 */
export function StudyTopicCard({ topic }: Props) {
  const [open, setOpen] = useState(false);
  const content = useTopicContent(topic.id);
  const hasContent = !!(content?.keyPoints?.length || content?.detailedContent);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden p-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <h3 className="text-[15px] font-semibold leading-snug">{topic.title}</h3>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="mt-0.5 shrink-0 text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      {!hasContent && (
        <p className="mt-1 text-xs text-muted-foreground">अभी अध्ययन सामग्री उपलब्ध नहीं है।</p>
      )}

      <AnimatePresence initial={false}>
        {open && hasContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              {content?.keyPoints?.length ? (
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" /> मुख्य बिंदु
                  </label>
                  <ul className="space-y-1.5 rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
                    {content.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {content?.detailedContent ? (
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" /> विस्तृत जानकारी
                  </label>
                  <div className="whitespace-pre-line rounded-lg bg-muted/40 px-3 py-2.5 text-sm leading-relaxed">
                    {content.detailedContent}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
