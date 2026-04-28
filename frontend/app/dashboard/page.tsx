"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Download, ExternalLink, Eye, FilePlus2, FileText, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import UploadZone from "@/components/ui/UploadZone";
import { apiFetch } from "@/lib/api";
import { copyToClipboard, formatDate, polygonscanTxUrl, truncateHash } from "@/lib/utils";

type LiveDocument = {
  id: string;
  title: string;
  hash: string;
  status: "anchoring" | "confirmed" | "tampered";
  txHash: string | null;
  block: number | null;
  timestamp: string;
};

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneTx, setDoneTx] = useState<string | null>(null);
  const [documents, setDocuments] = useState<LiveDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
    [],
  );

  const loadDocuments = async () => {
    try {
      const res = await apiFetch("/api/documents");
      const data = await res.json();
      if (res.ok && Array.isArray(data.documents)) setDocuments(data.documents);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => { void loadDocuments(); }, []);

  const onAnchor = async () => {
    if (!file) { toast.error("Please select a file."); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiFetch("/api/documents/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      toast.success("Document anchored to blockchain");
      setDoneTx(data.document?.id || "queued");
      await loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onDownloadCertificate = (doc: LiveDocument) => {
    const content = [
      "ShieldLedger Certificate of Authenticity",
      "",
      `Document: ${doc.title}`,
      `SHA-3 Hash: ${doc.hash}`,
      `Status: ${doc.status}`,
      `Anchored: ${doc.timestamp}`,
      doc.txHash ? `TX Hash: ${doc.txHash}` : "",
      doc.block ? `Block: ${doc.block}` : "",
      "",
      `Verify at: ${window.location.origin}/verify/${doc.hash}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `certificate-${doc.id.slice(0, 8)}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mb-6 text-muted">{today}</p>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={FileText} label="Total Documents" value={documents.length} color="#6C63FF" />
        <MetricCard icon={CheckCircle} label="Confirmed On-Chain" value={documents.filter((d) => d.status === "confirmed").length} color="#00D9A3" />
        <MetricCard icon={Clock} label="Pending Anchoring" value={documents.filter((d) => d.status === "anchoring").length} color="#F59E0B" />
        <MetricCard icon={Users} label="Signatories Added" value={0} color="#8B5CF6" />
      </div>

      <div className="glass-card mt-8 overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface2/70 text-left text-muted">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Hash</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <motion.tr
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border-t border-border hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">{doc.title}</td>
                <td className="px-4 py-3 text-muted">{formatDate(String(doc.timestamp))}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={async () => { await copyToClipboard(doc.hash); toast.success("Hash copied"); }}
                    className="font-mono text-primary hover:underline"
                  >
                    {truncateHash(doc.hash, 16)}
                  </button>
                </td>
                <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Link href={`/documents/${doc.id}`} className="rounded-lg p-1 hover:bg-surface2 hover:text-text">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button onClick={() => onDownloadCertificate(doc)} className="rounded-lg p-1 hover:bg-surface2 hover:text-text">
                      <Download className="h-4 w-4" />
                    </button>
                    {doc.txHash && (
                      <a href={polygonscanTxUrl(doc.txHash)} target="_blank" rel="noreferrer" className="rounded-lg p-1 hover:bg-surface2 hover:text-text">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
            {!loadingDocs && documents.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={5}>
                  No anchored documents yet. Upload one to create your first on-chain record.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => { setShowModal(true); setDoneTx(null); setFile(null); }}
        className="fixed bottom-6 right-6 rounded-full bg-gradient-to-r from-primary to-indigo-500 p-4 text-white shadow-lg transition hover-glow-purple"
        title="Upload Document"
      >
        <FilePlus2 className="h-6 w-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card w-full max-w-xl rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Register New Document</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted" /></button>
            </div>

            {!doneTx ? (
              <>
                <UploadZone onFileAccepted={setFile} />
                <button
                  onClick={onAnchor}
                  disabled={loading || !file}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-3 font-semibold transition hover-glow-purple disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload & Anchor to Blockchain"}
                </button>
                {loading && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface2">
                    <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-secondary" />
                <p className="mt-2 text-lg font-semibold">Document uploaded successfully</p>
                <p className="mt-1 text-sm text-muted">Anchoring to blockchain in progress...</p>
                <button onClick={() => { setShowModal(false); setDoneTx(null); setFile(null); }} className="mt-4 rounded-xl border border-border px-4 py-2 hover:bg-surface2">
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
