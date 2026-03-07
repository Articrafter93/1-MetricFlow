"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Settings2, Users } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  workspaceName: string;
  roleLabel: string;
};

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team Settings", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: Settings2 },
];

export function DashboardShell({
  children,
  workspaceName,
  roleLabel,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#17253a,_#070b14_45%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1320px] gap-4 p-4 lg:grid-cols-[240px_1fr] lg:p-6">
        <aside className="glass-panel flex flex-col justify-between p-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">MetricFlow</p>
            <h2 className="mt-3 text-xl font-semibold">{workspaceName}</h2>
            <p className="mt-1 text-xs text-slate-400">{roleLabel}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                    active
                      ? "border-sky-400/50 bg-sky-500/20 text-sky-100"
                      : "border-slate-800 bg-slate-950/30 text-slate-300 hover:border-slate-600",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="mt-8 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-rose-400/70 hover:text-rose-200"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}
