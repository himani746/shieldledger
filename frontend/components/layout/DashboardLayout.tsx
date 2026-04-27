"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";

type Props = {
  children: ReactNode;
};

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/verify": "Verify Document",
  "/settings": "Settings",
};

export default function DashboardLayout({ children }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Sidebar />
      <main className="md:ml-60">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/60 px-6 py-4 backdrop-blur-md">
          <h1 className="text-xl font-semibold">{titleMap[pathname] ?? "ShieldLedger"}</h1>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="h-[calc(100vh-73px)] overflow-y-auto p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
