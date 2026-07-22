import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/db/DataContext";
import { SYLLABUS, getAllTopics } from "@/lib/syllabus/syllabusData";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Flame, Trophy, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "सांख्यिकी" }, { name: "description", content: "प्रगति ग्राफ, स्ट्रीक व उपलब्धियाँ।" }] }),
  component: StatsPage,
});

function StatsPage() {
  const { topicStates, dailyLog, streak } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const completed = all.filter(r => topicStates[r.topic.id]?.isCompleted).length;

  const subjectData = SYLLABUS.map(s => {
    const total = s.units.reduce((n, u) => n + u.topics.length, 0);
    const done = s.units.reduce((n, u) => n + u.topics.filter(t => topicStates[t.id]?.isCompleted).length, 0);
    return { name: s.name.split(" ")[0], done, total };
  });

  const last14 = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const entry = dailyLog.find(x => x.date === key);
    return { day: `${d.getDate()}/${d.getMonth()+1}`, count: entry?.completedTopicIds.length ?? 0 };
  });

  const difficultyPie = (["आसान", "मध्यम", "कठिन"] as const).map(d => ({
    name: d,
    value: all.filter(r => topicStates[r.topic.id]?.difficulty === d).length,
  }));
  const diffColors = ["var(--color-easy)", "var(--color-medium)", "var(--color-hard)"];

  const achievements = [
    { id: "first", label: "पहला टॉपिक पूर्ण", icon: CheckCircle2, unlocked: completed >= 1 },
    { id: "ten", label: "10 टॉपिक्स पूर्ण", icon: Award, unlocked: completed >= 10 },
    { id: "fifty", label: "50 टॉपिक्स पूर्ण", icon: Award, unlocked: completed >= 50 },
    { id: "streak3", label: "3 दिन स्ट्रीक", icon: Flame, unlocked: streak.longest >= 3 },
    { id: "streak7", label: "7 दिन स्ट्रीक", icon: Flame, unlocked: streak.longest >= 7 },
    { id: "streak30", label: "30 दिन स्ट्रीक", icon: Trophy, unlocked: streak.longest >= 30 },
  ];

  return (
    <AppShell title="सांख्यिकी" subtitle="आपकी प्रगति का विश्लेषण" back>
      <div className="space-y-4">
        <div className="card-surface p-4">
          <h2 className="mb-3 text-sm font-bold">पिछले 14 दिन</h2>
          <div className="h-40">
            <ResponsiveContainer>
              <LineChart data={last14} margin={{ left: -20, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="mb-3 text-sm font-bold">विषय-वार प्रगति</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={subjectData} margin={{ left: -20, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" fill="var(--color-muted)" radius={[4,4,0,0]} />
                <Bar dataKey="done" fill="var(--color-primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="mb-3 text-sm font-bold">कठिनाई वितरण</h2>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={difficultyPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {difficultyPie.map((_, i) => <Cell key={i} fill={diffColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-3 text-xs">
            {difficultyPie.map((d, i) => (
              <span key={d.name} className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: diffColors[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="mb-3 text-sm font-bold">उपलब्धियाँ</h2>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="rounded-xl border border-border p-2.5 text-center"
                     style={{ opacity: a.unlocked ? 1 : 0.4, background: a.unlocked ? "color-mix(in oklab, var(--color-primary) 8%, transparent)" : "transparent" }}>
                  <Icon className="mx-auto h-6 w-6" style={{ color: a.unlocked ? "var(--color-primary)" : "var(--color-muted-foreground)" }} />
                  <div className="mt-1 text-[10px] font-semibold leading-tight">{a.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
