import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Check, Edit3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/db/DataContext";

export const Route = createFileRoute("/doubts")({
  head: () => ({ meta: [{ title: "मेरे डाउट्स" }, { name: "description", content: "जल्दी में लिखे नोट्स और डाउट्स।" }] }),
  component: DoubtsPage,
});

function DoubtsPage() {
  const { personalReminders, addReminder, toggleReminder, removeReminder } = useData();
  const [input, setInput] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addReminder(input.trim());
    setInput("");
  };

  return (
    <AppShell title="मेरे डाउट्स" subtitle={`${personalReminders.length} नोट्स`} back>
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
        <div className="mb-4 flex items-center gap-2 font-bold text-yellow-800">
          <Edit3 className="h-4 w-4" /> <h2>मेरे रिमाइंडर्स और डाउट्स</h2>
        </div>
        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="डाउट लिखें..."
            className="flex-1 rounded-xl border bg-white p-2 text-sm"
          />
          <button type="submit" className="rounded-xl bg-yellow-500 p-2 text-white touch-tap" aria-label="जोड़ें">
            <Plus />
          </button>
        </form>
        <div className="space-y-2">
          {personalReminders.length === 0 && (
            <p className="py-4 text-center text-sm text-yellow-700/70">अभी कोई डाउट नहीं लिखा गया।</p>
          )}
          {personalReminders.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border bg-white p-2">
              <div className="flex cursor-pointer items-center gap-2" onClick={() => toggleReminder(r.id)}>
                <div className={`grid h-5 w-5 place-items-center rounded border ${r.isCompleted ? "bg-green-500 text-white" : ""}`}>
                  {r.isCompleted && <Check size={12} />}
                </div>
                <span className={r.isCompleted ? "text-gray-400 line-through" : ""}>{r.text}</span>
              </div>
              <button onClick={() => removeReminder(r.id)} className="text-red-500 touch-tap" aria-label="हटाएँ">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
