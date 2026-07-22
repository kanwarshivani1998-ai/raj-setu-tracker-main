import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/db/DataContext";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Bell, BookMarked, CalendarClock, ChevronRight, Clock, Download, Edit3, Moon, Repeat, StickyNote, Sun, Trash2, Upload, Monitor, BarChart3 } from "lucide-react";
import { fireNotification, isNotificationSupported, requestNotificationPermission } from "@/lib/notifications/notify";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "सेटिंग्स" }, { name: "description", content: "थीम, अधिसूचना, डेटा प्रबंधन।" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings, resetAll, exportJSON, importJSON } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);

  const handleExport = async () => {
    const json = await exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cet-tracker-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("प्रगति निर्यात हो गई।");
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      await importJSON(text);
      toast.success("प्रगति सफलतापूर्वक आयात हुई।");
    } catch (e) {
      toast.error("आयात विफल — फ़ाइल अमान्य है।");
    }
  };

  const requestNotif = async () => {
    const supported = await isNotificationSupported();
    if (!supported) { toast.error("यह डिवाइस अधिसूचना का समर्थन नहीं करता।"); return; }
    const granted = await requestNotificationPermission();
    if (granted) {
      await updateSettings({ notificationsEnabled: true });
      toast.success("अधिसूचना सक्षम हो गई।");
      await fireNotification("Rajasthan CET Tracker", "अधिसूचना सक्रिय — रोज़ाना अध्ययन याद रहे!");
    } else {
      toast.error("अनुमति अस्वीकृत — फ़ोन की Settings ऐप में जाकर इस ऐप को अधिसूचना अनुमति दें।");
    }
  };

  return (
    <AppShell title="सेटिंग्स" subtitle="ऐप को अपने अनुसार सेट करें">
      <div className="space-y-4">
        <Section title="थीम">
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "light", label: "लाइट", icon: Sun },
              { v: "dark", label: "डार्क", icon: Moon },
              { v: "system", label: "सिस्टम", icon: Monitor },
            ] as const).map(o => {
              const Icon = o.icon;
              const active = settings.theme === o.v;
              return (
                <button key={o.v}
                        onClick={() => updateSettings({ theme: o.v })}
                        className="flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold touch-tap"
                        style={{
                          borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                          background: active ? "color-mix(in oklab, var(--color-primary) 12%, transparent)" : "transparent",
                          color: active ? "var(--color-primary)" : "var(--color-foreground)",
                        }}>
                  <Icon className="h-5 w-5" />
                  {o.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="दैनिक लक्ष्य">
          <Field label="टॉपिक्स प्रति दिन">
            <input type="number" min={1} max={20}
              value={settings.dailyTargetTopics}
              onChange={(e) => updateSettings({ dailyTargetTopics: Math.max(1, parseInt(e.target.value || "1")) })}
              className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-right text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="अध्ययन मिनट">
            <input type="number" min={15} max={720} step={15}
              value={settings.dailyTargetMinutes}
              onChange={(e) => updateSettings({ dailyTargetMinutes: Math.max(15, parseInt(e.target.value || "15")) })}
              className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-right text-sm outline-none focus:border-primary" />
          </Field>
        </Section>

        <Section title="परीक्षा तिथि">
          <Field label="CET परीक्षा दिनांक">
            <input type="date"
              value={settings.examDate ?? ""}
              onChange={(e) => updateSettings({ examDate: e.target.value || undefined })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
        </Section>

        <Section title="अधिसूचना">
          <Field label="दैनिक याद दिलाने का समय">
            <input type="time"
              value={settings.notificationTime}
              onChange={(e) => updateSettings({ notificationTime: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
          <button onClick={requestNotif}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-bold touch-tap">
            <Bell className="h-4 w-4" />
            {settings.notificationsEnabled ? "अधिसूचना सक्षम है" : "अधिसूचना अनुमति दें"}
          </button>
        </Section>

        <Section title="त्वरित पहुँच">
          <LinkRow to="/schedule" icon={CalendarClock} label="डेली स्टडी शेड्यूल" />
          <LinkRow to="/stats" icon={BarChart3} label="सांख्यिकी व उपलब्धियाँ" />
          <LinkRow to="/notes" icon={StickyNote} label="सभी नोट्स" />
          <LinkRow to="/bookmarks" icon={BookMarked} label="बुकमार्क्स" />
          <LinkRow to="/revision" icon={Repeat} label="रिवीजन" />
          <LinkRow to="/timetable" icon={Clock} label="टाइम-टेबल व अलार्म" />
          <LinkRow to="/doubts" icon={Edit3} label="मेरे डाउट्स" />
        </Section>

        <Section title="डेटा प्रबंधन">
          <button onClick={handleExport}
                  className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-input py-2.5 text-sm font-semibold touch-tap">
            <Download className="h-4 w-4" /> प्रगति निर्यात करें (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-input py-2.5 text-sm font-semibold touch-tap">
            <Upload className="h-4 w-4" /> प्रगति आयात करें (JSON)
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
                 onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }} />
          {!confirming ? (
            <button onClick={() => setConfirming(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-destructive-foreground touch-tap"
                    style={{ background: "var(--color-destructive)" }}>
              <Trash2 className="h-4 w-4" /> सारा डेटा रीसेट करें
            </button>
          ) : (
            <div className="mt-3 rounded-lg border border-destructive/50 p-3">
              <p className="mb-2 text-xs font-semibold text-destructive">क्या आप निश्चित हैं? सारा डेटा हट जाएगा।</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)}
                        className="flex-1 rounded-lg border border-input py-2 text-sm font-semibold touch-tap">रद्द करें</button>
                <button onClick={async () => { await resetAll(); setConfirming(false); toast.success("सारा डेटा रीसेट हो गया।"); }}
                        className="flex-1 rounded-lg py-2 text-sm font-bold text-destructive-foreground touch-tap"
                        style={{ background: "var(--color-destructive)" }}>हाँ, रीसेट करें</button>
              </div>
            </div>
          )}
        </Section>

        <p className="pb-4 pt-2 text-center text-[11px] text-muted-foreground">
          सारा डेटा आपके डिवाइस पर सुरक्षित है • कोई सर्वर नहीं • 100% ऑफलाइन
        </p>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="card-surface p-3">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
function LinkRow({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
