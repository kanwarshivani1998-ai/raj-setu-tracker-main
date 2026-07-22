import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, Calendar, CalendarClock, Repeat, BookMarked, Zap, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CircularProgress } from "@/components/CircularProgress";
import { useData } from "@/lib/db/DataContext";
import { HINDI_QUOTES, getAllTopics } from "@/lib/syllabus/syllabusData";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "मुख्य पृष्ठ — Rajasthan CET Tracker" },
      { name: "description", content: "आपकी CET तैयारी का समग्र सारांश — प्रगति, स्ट्रीक, और आज का लक्ष्य।" },
    ],
  }),
  component: Dashboard,
});

function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000*60*60*24));
}

function Dashboard() {
  const { ready, topicStates, dailyLog, streak, settings } = useData();
  const all = useMemo(() => getAllTopics(), []);

  const completed = all.filter((r) => topicStates[r.topic.id]?.isCompleted).length;
  const total = all.length;
  const pct = total ? (completed / total) * 100 : 0;
  const remaining = total - completed;

  const today = todayStr();
  const todayLog = dailyLog.find((d) => d.date === today);
  const todayCompleted = todayLog?.completedTopicIds.length ?? 0;
  const targetTopics = settings.dailyTargetTopics;

  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6);
  const weekCompleted = dailyLog
    .filter((d) => new Date(d.date) >= weekStart)
    .reduce((n, d) => n + d.completedTopicIds.length, 0);

  const monthStart = new Date(); monthStart.setDate(monthStart.getDate() - 29);
  const monthCompleted = dailyLog
    .filter((d) => new Date(d.date) >= monthStart)
    .reduce((n, d) => n + d.completedTopicIds.length, 0);

  const revisionDue = all.filter((r) => topicStates[r.topic.id]?.markedForRevision).length;

  const examDaysLeft = settings.examDate ? Math.max(0, daysBetween(new Date(), new Date(settings.examDate))) : null;

  const quote = HINDI_QUOTES[new Date().getDate() % HINDI_QUOTES.length];

  if (!ready) {
    return <AppShell title="मुख्य पृष्ठ"><div className="animate-pulse text-muted-foreground">लोड हो रहा है…</div></AppShell>;
  }

  return (
    <AppShell title="मुख्य पृष्ठ" subtitle="Rajasthan CET अध्ययन ट्रैकर">
      {/* Hero progress */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card-surface relative overflow-hidden p-5"
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-20 gradient-primary" />
        <div className="relative grid grid-cols-[auto_1fr] items-center gap-4">
          <CircularProgress value={pct} label="कुल प्रगति" size={132} stroke={12} />
          <div className="min-w-0 space-y-2">
            <div>
              <div className="text-2xl font-black tabular-nums leading-none">{completed}<span className="text-base font-semibold text-muted-foreground">/{total}</span></div>
              <div className="text-xs font-medium text-muted-foreground">पूर्ण टॉपिक्स</div>
            </div>
            <div>
              <div className="text-lg font-bold tabular-nums text-accent">{remaining}</div>
              <div className="text-xs font-medium text-muted-foreground">शेष टॉपिक्स</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Today's target */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="mt-3 card-surface p-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary"><Target className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">आज का लक्ष्य</h2>
            <p className="text-[11px] text-muted-foreground">{todayCompleted} / {targetTopics} टॉपिक्स पूर्ण</p>
          </div>
          <Link to="/today" className="text-xs font-semibold text-primary">देखें →</Link>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (todayCompleted / Math.max(1, targetTopics)) * 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </motion.section>

      {/* Stat grid */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        <StatTile icon={Flame} label="वर्तमान स्ट्रीक" value={`${streak.current} दिन`} tone="primary" />
        <StatTile icon={Trophy} label="सबसे लंबी स्ट्रीक" value={`${streak.longest} दिन`} tone="accent" />
        <StatTile icon={Zap} label="इस सप्ताह" value={`${weekCompleted} पूर्ण`} tone="accent" />
        <StatTile icon={Zap} label="इस माह" value={`${monthCompleted} पूर्ण`} tone="primary" />
      </section>

      {/* Quick links */}
      <section className="mt-3 space-y-2">
        <QuickLink to="/schedule" icon={CalendarClock} label="डेली स्टडी शेड्यूल" hint="5 घंटे टाइम-टेबल" />
        <QuickLink to="/revision" icon={Repeat} label="रिवीजन बकाया" hint={`${revisionDue} टॉपिक्स`} />
        <QuickLink to="/weak" icon={BookMarked} label="कमजोर विषय" hint="कठिन चिह्नित" />
        <QuickLink
          to="/settings"
          icon={Calendar}
          label="परीक्षा तक शेष"
          hint={examDaysLeft !== null ? `${examDaysLeft} दिन` : "तिथि सेट करें"}
        />
      </section>

      {/* Quote */}
      <motion.blockquote
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center"
      >
        <p className="text-sm font-medium italic text-foreground">“{quote}”</p>
      </motion.blockquote>
    </AppShell>
  );
}

function StatTile({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "accent" }) {
  return (
    <div className="card-surface p-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg"
           style={{ background: tone === "primary" ? "color-mix(in oklab, var(--color-primary) 15%, transparent)" : "color-mix(in oklab, var(--color-accent) 15%, transparent)",
                    color: tone === "primary" ? "var(--color-primary)" : "var(--color-accent)" }}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-lg font-black tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, hint }: { to: string; icon: any; label: string; hint: string }) {
  return (
    <Link to={to} className="card-surface flex items-center gap-3 p-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
