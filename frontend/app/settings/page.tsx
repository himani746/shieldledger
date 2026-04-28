"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [orgName, setOrgName] = useState(session?.user?.name || "");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const onSaveOrg = async () => {
    if (orgName.trim().length < 2) { toast.error("Organisation name is required."); return; }
    setSavingOrg(true);
    try {
      const res = await apiFetch("/api/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_name: orgName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      await update({ name: orgName.trim() });
      toast.success("Organisation name updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSavingOrg(false); }
  };

  const onUpdatePassword = async () => {
    if (!currentPassword) { toast.error("Enter your current password."); return; }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
    setSavingPw(true);
    try {
      const res = await apiFetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password update failed");
      toast.success("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password update failed");
    } finally { setSavingPw(false); }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Organisation Settings</h2>
          <div className="space-y-3">
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Organisation name"
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary"
            />
            <input
              value={session?.user?.email || ""}
              readOnly
              className="w-full rounded-xl border border-border bg-surface2/60 px-3 py-2 text-muted"
            />
            <button
              onClick={onSaveOrg}
              disabled={savingOrg}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 font-semibold hover-glow-purple disabled:opacity-50"
            >
              {savingOrg ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Security</h2>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary"
            />
            <button
              onClick={onUpdatePassword}
              disabled={savingPw}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 font-semibold disabled:opacity-50"
            >
              {savingPw ? "Updating..." : "Update Password"}
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
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mt-3 w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDelete(false)} className="rounded-xl border border-border px-4 py-2">Cancel</button>
              <button
                disabled={deleteConfirm !== "DELETE"}
                className="rounded-xl border border-red-400/50 px-4 py-2 text-red-300 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
