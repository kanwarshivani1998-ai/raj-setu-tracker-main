import { BookOpen } from "lucide-react";
import { unlockAudio } from "@/lib/audio/audioContext";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const handleStart = async () => {
    try {
      await unlockAudio();
    } catch (e) {
      console.error("Audio unlock failed", e);
    }
    onStart();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-primary px-6 text-center text-primary-foreground">
      <BookOpen className="mb-6 h-16 w-16 animate-bounce" />
      <h1 className="mb-2 text-3xl font-bold">CET Study Tracker</h1>
      <p className="mb-10 text-sm opacity-90">आपका व्यक्तिगत स्मार्ट टाइम-टेबल</p>
      <button
        onClick={handleStart}
        className="rounded-full bg-white px-8 py-4 text-lg font-bold text-primary shadow-xl transition-all active:scale-95 touch-tap"
      >
        आज की पढ़ाई शुरू करें
      </button>
    </div>
  );
}
