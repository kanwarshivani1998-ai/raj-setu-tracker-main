import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StudyMaterial } from "@/components/StudyMaterial";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "अध्ययन सामग्री — Rajasthan CET Tracker" },
      { name: "description", content: "सभी विषयों की विस्तृत अध्ययन सामग्री।" },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  return (
    <AppShell title="अध्ययन सामग्री" subtitle="विषय पर टैप करें">
      <StudyMaterial />
    </AppShell>
  );
}
