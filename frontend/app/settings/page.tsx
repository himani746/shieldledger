"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [orgName, setOrgName] = useState(session?.user?.name || "");
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState("");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Organisation Settings</h2>
          <div className="mb-4">
            <div className="group relative h-20 w-20 rounded-full bg-primary/20">
              <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">TC</span>
              <button className="absolute inset-0 rounded-full bg-black/50 text-xs opacity-0 transition group-hover:opacity-100">
                Upload
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary" />
            {orgName.trim().length < 2 && <p className="text-sm text-red-400">Organisation name is required.</p>}
            <input value={session?.user?.email || ""} readOnly className="w-full rounded-xl border border-border bg-surface2/60 px-3 py-2 text-muted" />
            <button className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 font-semibold hover-glow-purple">
              Save Changes
            </button>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Security</h2>
          <div className="space-y-3">
            <input type="password" placeholder="Current password" className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary" />
            <input type="password" placeholder="New password" className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary" />
            <input type="password" placeholder="Confirm new password" className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary" />
            <button className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 font-semibold">
              Update Password
            </button>
          </div>
        </section>

        <section className="glass-card rounded-2xl border border-red-400/40 p-6">
          <h2 className="mb-3 text-xl font-semibold text-red-300">Danger Zone</h2>
          <button onClick={() => setShowDelete(true)} className="rounded-xl border border-red-400/50 px-4 py-2 text-red-300 hover:bg-red-500/10">
            Delete Account
          </button>
        </section>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md rounded-2xl p-5">
            <h3 className="text-lg font-semibold">Confirm account deletion</h3>
            <p className="mt-2 text-sm text-muted">This action cannot be undone. Type DELETE to continue.</p>
            <input onChange={(e) => setError(e.target.value === "DELETE" ? "" : "Type DELETE to confirm.")} className="mt-3 w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none" />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDelete(false)} className="rounded-xl border border-border px-4 py-2">Cancel</button>
              <button disabled={error !== ""} className="rounded-xl border border-red-400/50 px-4 py-2 text-red-300 disabled:opacity-50">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
