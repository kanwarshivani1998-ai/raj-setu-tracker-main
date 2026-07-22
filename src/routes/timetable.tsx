import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/db/DataContext";

export const Route = createFileRoute("/timetable")({
  head: () => ({ meta: [{ title: "टाइम-टेबल" }, { name: "description", content: "दैनिक अलार्म व टाइम-टेबल प्रबंधन।" }] }),
  component: TimetablePage,
});

function TimetablePage() {
  const { timetable, addTimetableItem, updateTimetableItem, removeTimetableItem } = useData();
  const [task, setTask] = useState("");
  const [time, setTime] = useState("07:00");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    await addTimetableItem({ task: task.trim(), startTime24: time, days: [], enabled: true });
    setTask("");
  };

  return (
    <AppShell title="टाइम-टेबल" subtitle="दैनिक अलार्म सेट करें" back>
      <form onSubmit={handleAdd} className="card-surface mb-4 space-y-3 p-3">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="जैसे: गणित का अध्ययन"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg gradient-primary touch-tap"
            aria-label="अलार्म जोड़ें"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </form>

      <div className="space-y-2.5">
        {timetable.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">अभी कोई अलार्म सेट नहीं है।</p>
        )}
        {timetable.map((item) => (
          <div key={item.id} className="card-surface flex items-center gap-3 p-3">
            <button
              onClick={() => updateTimetableItem({ ...item, enabled: !item.enabled })}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg touch-tap"
              style={{
                background: item.enabled ? "color-mix(in oklab, var(--color-primary) 15%, transparent)" : "transparent",
                color: item.enabled ? "var(--color-primary)" : "var(--color-muted-foreground)",
              }}
              aria-label={item.enabled ? "अलार्म बंद करें" : "अलार्म चालू करें"}
            >
              <Clock className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-semibold ${!item.enabled ? "text-muted-foreground line-through" : ""}`}>
                {item.task}
              </div>
              <div className="text-xs text-muted-foreground">{item.startTime24} • रोज़ाना</div>
            </div>
            <button
              onClick={() => removeTimetableItem(item.id)}
              className="grid h-9 w-9 place-items-center rounded-lg text-destructive touch-tap"
              aria-label="अलार्म हटाएँ"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
