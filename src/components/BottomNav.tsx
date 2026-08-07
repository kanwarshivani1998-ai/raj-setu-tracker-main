import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, GraduationCap, Search, Settings, FileText } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "मुख्य पृष्ठ", icon: Home, match: (p: string) => p === "/" },
  { to: "/syllabus", label: "पाठ्यक्रम", icon: BookOpen, match: (p: string) => p.startsWith("/syllabus") },
  { to: "/exam-syllabus", label: "सिलेबस", icon: FileText, match: (p: string) => p.startsWith("/exam-syllabus") },
  { to: "/study", label: "अध्ययन", icon: GraduationCap, match: (p: string) => p.startsWith("/study") },
  { to: "/search", label: "खोजें", icon: Search, match: (p: string) => p.startsWith("/search") },
  { to: "/settings", label: "सेटिंग्स", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-6">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className="relative flex flex-col items-center justify-center gap-1 px-0.5 py-2.5 touch-tap"
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full gradient-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className="h-[18px] w-[18px] transition-colors"
                  style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
                />
                <span
                  className="text-center text-[9.5px] leading-tight font-medium transition-colors"
                  style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
                >
                  {it.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
