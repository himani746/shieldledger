"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clipboard, Download, FileText, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BlockchainProofCard from "@/components/ui/BlockchainProofCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";
import { copyToClipboard, formatDate } from "@/lib/utils";

type DocDetail = {
  id: string;
  title: string;
  sha3_hash: string;
  status: string;
  created_at: string;
  anchor_events: { tx_hash: string; block_number: number; anchored_at: string }[];
  signatories: { id: string; email: string; signed_at: string | null }[];
};

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const docId = params.id;
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiFetch(`/api/documents/${docId}/audit`);
        if (res.ok) {
          // audit returns PDF — fall back to documents list for details
        }
        // Fetch document details via documents list
        const listRes = await apiFetch("/api/documents");
        const listData = await listRes.json();
        if (listRes.ok && Array.isArray(listData.documents)) {
          const found = listData.documents.find((d: { id: string }) => d.id === docId);
          if (found) {
            setDoc({
              id: found.id,
              title: found.title,
              sha3_hash: found.hash,
              status: found.status,
              created_at: found.timestamp,
              anchor_events: found.txHash
                ? [{ tx_hash: found.txHash, block_number: found.block || 0, anchored_at: found.timestamp }]
                : [],
              signatories: [],
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [docId]);

  const latestAnchor = useMemo(() => doc?.anchor_events?.[0] ?? null, [doc]);

  const onDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const res = await apiFetch(`/api/documents/${docId}/certificate`);
      if (!res.ok) { toast.error("Certificate not available yet."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `certificate-${docId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Failed to download certificate."); }
    finally { setDownloading(false); }
  };

  const onDownloadAudit = async () => {
    try {
      const res = await apiFetch(`/api/documents/${docId}/audit`);
      if (!res.ok) { toast.error("Audit report not available."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `audit-${docId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Failed to download audit report."); }
  };

  const onInviteSignatory = async () => {
    if (!inviteEmail.includes("@")) { toast.error("Enter a valid email."); return; }
    setInviting(true);
    try {
      const res = await apiFetch(`/api/documents/${docId}/signatories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invite failed");
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally { setInviting(false); }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="text-muted">Loading document details...</div>
      ) : !doc ? (
        <div className="glass-card rounded-2xl p-6 text-sm text-muted">Document not found.</div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="text-primary" />
                  <h2 className="text-lg font-semibold">{doc.title}</h2>
                </div>
                <div className="space-y-2 text-sm text-muted">
                  <p>Uploaded: {formatDate(doc.created_at)}</p>
                  <StatusBadge status={doc.status as "anchoring" | "confirmed" | "tampered"} />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <p className="mb-2 text-sm text-muted">SHA-3 Document Hash</p>
                <p className="shimmer-text break-all font-mono text-primary text-xs">{doc.sha3_hash}</p>
                <button
                  onClick={async () => { await copyToClipboard(doc.sha3_hash); toast.success("Copied!"); }}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-sm hover:bg-surface2"
                >
                  <Clipboard className="h-4 w-4" /> Copy Hash
                </button>
              </div>

              {latestAnchor && (
                <BlockchainProofCard
                  txHash={latestAnchor.tx_hash}
                  blockNumber={Number(latestAnchor.block_number)}
                  network="Polygon Mumbai"
                  anchoredAt={latestAnchor.anchored_at}
                  authentic
                />
              )}
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="mb-4 font-semibold">Invite Signatory</h3>
                <div className="flex gap-2">
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="signatory@company.com"
                    className="flex-1 rounded-xl border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={onInviteSignatory}
                    disabled={inviting}
                    className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-3 py-2 text-sm font-semibold hover-glow-purple disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
                {doc.signatories.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {doc.signatories.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted">{s.email}</span>
                        <span className={s.signed_at ? "text-secondary" : "text-amber-400"}>
                          {s.signed_at ? "Signed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h3 className="mb-4 font-semibold">Anchor Events</h3>
                {doc.anchor_events.length === 0 ? (
                  <p className="text-sm text-muted">No anchor events yet — anchoring in progress.</p>
                ) : (
                  <div className="space-y-3">
                    {doc.anchor_events.map((ev, i) => (
                      <div key={ev.tx_hash} className="text-sm">
                        <p className="font-medium">Event #{i + 1} · Block {Number(ev.block_number).toLocaleString()}</p>
                        <p className="break-all font-mono text-xs text-muted">{ev.tx_hash}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onDownloadCertificate}
              disabled={downloading}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 text-sm font-semibold hover-glow-purple disabled:opacity-50"
            >
              <Download className="mr-2 inline h-4 w-4" />
              {downloading ? "Generating..." : "Download Certificate"}
            </button>
            <button
              onClick={onDownloadAudit}
              className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface2"
            >
              <Download className="mr-2 inline h-4 w-4" /> Download Audit Report
            </button>
            <button
              onClick={() => router.push("/verify")}
              className="rounded-xl border border-red-400/40 px-4 py-2 text-xs text-red-300 hover:bg-red-500/10"
            >
              <AlertTriangle className="mr-2 inline h-4 w-4" /> Verify Another Hash
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
