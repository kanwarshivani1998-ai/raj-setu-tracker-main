import { useMemo } from "react";
import { Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HINDI_QUOTES } from "@/lib/syllabus/syllabusData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MotivationModal({ isOpen, onClose }: Props) {
  const quote = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return HINDI_QUOTES[dayIndex % HINDI_QUOTES.length];
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[50000] flex items-center justify-center bg-black/80 p-6"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative w-full max-w-sm rounded-3xl p-8 text-center text-white shadow-2xl gradient-primary"
          >
            <button onClick={onClose} className="absolute right-4 top-4 touch-tap" aria-label="बंद करें">
              <X size={24} />
            </button>
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-yellow-300" />
            <h3 className="mb-4 text-xl font-bold">आज का जोश!</h3>
            <p className="text-lg font-medium italic">"{quote}"</p>
            <button
              onClick={onClose}
              className="mt-8 w-full rounded-xl bg-white py-4 font-bold text-primary touch-tap"
            >
              चलो, शुरू करते हैं!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
