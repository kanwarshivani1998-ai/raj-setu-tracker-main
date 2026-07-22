import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

interface AppShellProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, back, action, children }: AppShellProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background pb-24" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-sm items-center gap-3 px-4 py-3">
          {back ? (
            <button
              onClick={() => router.history.back()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-foreground touch-tap"
              aria-label="वापस"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary text-sm font-black">
              CET
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      </header>
      <main className="mx-auto max-w-screen-sm px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
