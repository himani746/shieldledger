"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "My Documents", icon: Files },
  { href: "/verify", label: "Verify", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const userName = useMemo(
    () => session?.user?.name ?? "My Organization",
    [session?.user?.name],
  );
  const email = session?.user?.email ?? "user@shieldledger.com";

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-border bg-surface p-2 text-text md:hidden"
      >
        {open ? <X /> : <Menu />}
      </button>
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-surface/90 p-4 backdrop-blur-md transition md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 text-lg font-semibold text-text">
          <Shield className="text-primary" />
          ShieldLedger
        </Link>

        <nav className="space-y-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl border-l-2 px-3 py-2 text-sm transition ${
                  active
                    ? "border-l-primary bg-primary/15 text-text"
                    : "border-l-transparent text-muted hover:translate-x-1 hover:bg-primary/10 hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={logout}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted transition hover:bg-primary/10 hover:text-text"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface2/60 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/30 text-xs font-semibold text-text">
              {initials(userName)}
            </div>
            <div>
              <p className="text-sm text-text">{userName}</p>
              <p className="text-xs text-muted">{email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
