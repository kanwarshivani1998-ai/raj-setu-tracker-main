import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Syllabus } from "@/components/Syllabus";

export const Route = createFileRoute("/syllabus/")({
  head: () => ({
    meta: [
      { title: "पाठ्यक्रम — Rajasthan CET Tracker" },
      { name: "description", content: "RSSB CET पाठ्यक्रम — सभी विषय, यूनिट व टॉपिक।" },
    ],
  }),
  component: SyllabusIndex,
});

function SyllabusIndex() {
  return (
    <AppShell title="पाठ्यक्रम" subtitle="विषय पर टैप करें">
      <Syllabus />
    </AppShell>
  );
}

