import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Coffee, Soup, Trophy, Clock3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "डेली शेड्यूल" },
      { name: "description", content: "CET (1 दिसंबर परीक्षा) — रोज़ाना 5 घंटे अध्ययन टाइम-टेबल।" },
    ],
  }),
  component: SchedulePage,
});

type Block = {
  time: string;
  duration: string;
  kind: "study" | "break";
  title: string;
  icon: typeof BookOpen;
};

const BLOCKS: Block[] = [
  { time: "06:00 AM – 07:00 AM", duration: "1 Hour", kind: "study", title: "Current Affairs & Daily Newspaper / Revision", icon: BookOpen },
  { time: "07:00 AM – 11:00 AM", duration: "Break", kind: "break", title: "Personal Work / Breakfast / Rest Break", icon: Coffee },
  { time: "11:00 AM – 12:30 PM", duration: "1.5 Hours", kind: "study", title: "Rajasthan GK (History, Art & Culture, Geography, Polity)", icon: BookOpen },
  { time: "12:30 PM – 01:00 PM", duration: "30 Mins", kind: "break", title: "Lunch Break", icon: Soup },
  { time: "01:00 PM – 02:30 PM", duration: "1.5 Hours", kind: "study", title: "Maths & Reasoning (Practice Questions)", icon: BookOpen },
  { time: "02:30 PM – 03:30 PM", duration: "1 Hour", kind: "study", title: "General Science & Computer", icon: BookOpen },
  { time: "03:30 PM – 04:30 PM", duration: "1 Hour", kind: "study", title: "Hindi & English Grammar", icon: BookOpen },
];

function SchedulePage() {
  return (
    <AppShell title="📚 डेली स्टडी शेड्यूल" subtitle="CET (1 DEC EXAM) — रोज़ाना 5 घंटे अध्ययन" back>
        <div className="card-surface mb-4 flex items-center gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">कुल अध्ययन समय: 5 घंटे / दिन</div>
            <div className="text-xs text-muted-foreground">परीक्षा तिथि: 1 दिसंबर 2026</div>
          </div>
        </div>

        <div className="relative space-y-3 pl-1">
          {BLOCKS.map((b, i) => {
            const Icon = b.icon;
            const isStudy = b.kind === "study";
            return (
              <div key={i} className="card-surface flex items-start gap-3 p-3.5">
                <div
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: isStudy
                      ? "color-mix(in oklab, var(--color-primary) 15%, transparent)"
                      : "color-mix(in oklab, var(--color-muted-foreground) 15%, transparent)",
                    color: isStudy ? "var(--color-primary)" : "var(--color-muted-foreground)",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-bold">{b.time}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: isStudy
                          ? "color-mix(in oklab, var(--color-primary) 15%, transparent)"
                          : "color-mix(in oklab, var(--color-accent) 15%, transparent)",
                        color: isStudy ? "var(--color-primary)" : "var(--color-accent)",
                      }}
                    >
                      {b.duration}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${isStudy ? "font-semibold" : "text-muted-foreground"}`}>
                    {isStudy ? "🔹 " : b.title.includes("Lunch") ? "🍱 " : "☕ "}
                    {b.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-surface mt-4 flex items-start gap-3 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">📌 Weekly Target</div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              हर रविवार — Full Length Mock Test & Review
            </p>
          </div>
        </div>
    </AppShell>
  );
}
