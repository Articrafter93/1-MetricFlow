"use client";

import type { Role } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  ChevronsLeftRightEllipsis,
  FileBarChart2,
  Home,
  LogOut,
  Settings2,
  UserCog,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { type ComponentType, useState } from "react";
import { type Permission, hasRequiredPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  tenantSlug: string;
  workspaceName: string;
  roleLabel: string;
  role: Role;
};

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission?: Permission;
};

const navItems: NavItem[] = [
  {
    key: "dashboard",
    href: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    permission: { resource: "dashboard", action: "view" },
  },
  {
    key: "analytics",
    href: "analytics",
    label: "Analytics",
    icon: FileBarChart2,
    permission: { resource: "analytics", action: "view" },
  },
  {
    key: "clients",
    href: "clients",
    label: "Clients",
    icon: Users,
    permission: { resource: "clients", action: "view" },
  },
  {
    key: "reports",
    href: "reports",
    label: "Reports",
    icon: Settings2,
    permission: { resource: "reports", action: "view" },
  },
  {
    key: "settings-team",
    href: "settings/team",
    label: "Team",
    icon: UserCog,
    permission: { resource: "team", action: "view" },
  },
  {
    key: "settings-workspace",
    href: "settings/workspace",
    label: "Workspace",
    icon: ChevronsLeftRightEllipsis,
    permission: { resource: "workspaceSettings", action: "view" },
  },
  {
    key: "settings-billing",
    href: "settings/billing",
    label: "Billing",
    icon: CreditCard,
    permission: { resource: "billingInternal", action: "view" },
  },
];

export function DashboardShell({
  children,
  tenantSlug,
  workspaceName,
  roleLabel,
  role,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-app text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-4 p-4 lg:grid-cols-[auto_1fr] lg:p-6">
        <aside
          className={cn(
            "glass-panel sidebar-shell flex flex-col justify-between p-4",
            collapsed ? "lg:w-16" : "lg:w-60",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <p
                className={cn(
                  "text-[11px] uppercase tracking-[0.2em] text-text-secondary",
                  collapsed && "sr-only",
                )}
              >
                Workspace
              </p>
              <button
                type="button"
                className="rounded-md border border-border bg-bg-elevated p-1 text-text-secondary transition hover:border-accent hover:text-text-primary"
                onClick={() => setCollapsed((current) => !current)}
                aria-label="Toggle sidebar"
              >
                <ChevronsLeftRightEllipsis className="h-4 w-4" />
              </button>
            </div>
            <h2
              className={cn(
                "mt-3 text-base font-semibold text-text-primary",
                collapsed && "hidden",
              )}
            >
              {workspaceName}
            </h2>
            <p className={cn("mt-1 text-xs text-text-secondary", collapsed && "hidden")}>
              {roleLabel}
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems
              .filter(
                (item) =>
                  !item.permission || hasRequiredPermission(role, item.permission),
              )
              .map((item) => {
              const Icon = item.icon;
              const href = `/${tenantSlug}/${item.href}`;
              const active = pathname === href;
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                    active
                      ? "border-accent bg-accent/15 text-text-primary"
                      : "border-border bg-bg-surface text-text-secondary hover:border-accent",
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                  <span className={cn(collapsed && "hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-secondary transition hover:border-accent hover:text-text-primary"
              title="Inicio"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && "hidden")}>Inicio</span>
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary transition hover:border-danger hover:text-danger"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && "hidden")}>Sign out</span>
            </button>
          </div>
        </aside>

        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}
