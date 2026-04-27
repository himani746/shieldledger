"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clipboard, Download, ExternalLink, FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BlockchainProofCard from "@/components/ui/BlockchainProofCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { apiFetch } from "@/lib/api";
import { copyToClipboard, formatDate, formatDateTime, truncateHash } from "@/lib/utils";

const TAMPERED_HASH = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

export default function DocumentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string;

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (!documentId) return;
    const fetchDocument = async () => {
      try {
        console.log('Fetching Document ID:', documentId);
        const res = await apiFetch(`/api/documents/${documentId}`);
        if (res.ok) {
          const data = await res.json();
          setDoc(data);
        } else {
          toast.error("Document not found.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load document.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [documentId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20 text-muted">
          <span className="mr-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
          Loading document...
        </div>
      </DashboardLayout>
    );
  }

  if (!doc) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted">
          <p className="text-lg">Document not found</p>
          <button onClick={() => router.push("/documents")} className="mt-4 rounded-xl border border-border px-4 py-2 hover:bg-surface2">
            Back to Documents
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isConfirmed = doc.status === "confirmed";
  const isAnchoring = doc.status === "anchoring";

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="text-primary" />
              <h2 className="text-lg font-semibold">{doc.title}</h2>
            </div>
            <div className="space-y-2 text-sm text-muted">
              <p>Uploaded: {formatDate(doc.date)}</p>
              <p>File type: {doc.mimeType || "Unknown"}</p>
              {doc.orgName && <p>Owner org: {doc.orgName}</p>}
              <StatusBadge status={doc.status} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <p className="mb-2 text-sm text-muted">SHA-3 Document Hash</p>
            <p className="shimmer-text break-all font-mono text-primary">{doc.hash}</p>
            <button
              onClick={async () => {
                await copyToClipboard(doc.hash);
                toast.success("Copied!");
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-sm hover:bg-surface2"
            >
              <Clipboard className="h-4 w-4" /> Copy
            </button>
          </div>

          {isConfirmed && doc.txHash ? (
            <BlockchainProofCard
              txHash={doc.txHash}
              blockNumber={doc.blockNumber}
              network={doc.network}
              anchoredAt={doc.anchoredAt}
              authentic
            />
          ) : (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-300">
                <Clock className="h-5 w-5" />
                <h3 className="font-semibold">Blockchain Anchoring In Progress</h3>
              </div>
              <p className="mt-2 text-sm text-muted">
                This document is queued for anchoring. The blockchain proof will appear here once the transaction is confirmed.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 font-semibold">Version History</h3>
            {doc.versions && doc.versions.length > 0 ? (
              <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-primary/40">
                {doc.versions.map((v: any) => (
                  <div key={v.version} className="relative pl-10">
                    <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs">{v.version}</span>
                    <p className="font-medium">v{v.version} · {v.note}</p>
                    <p className="text-sm text-muted">{v.hash ? truncateHash(v.hash, 20) : "N/A"}</p>
                    <p className="text-xs text-muted">{v.date ? formatDate(v.date) : ""}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No version history available yet.</p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 font-semibold">Signatories</h3>
            <div className="space-y-3">
              {doc.signatories && doc.signatories.length > 0 ? (
                doc.signatories.map((s: any) => (
                  <div key={s.email} className="flex items-center justify-between rounded-xl border border-border bg-surface2/40 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs">
                        {s.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm">{s.email}</p>
                        <p className="text-xs text-muted">{s.signedAt ? formatDateTime(s.signedAt) : "Pending"}</p>
                      </div>
                    </div>
                    {s.signedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No signatories invited yet.</p>
              )}
            </div>
            <button onClick={() => setInviteOpen((v) => !v)} className="mt-4 rounded-xl border border-secondary/40 px-4 py-2 text-secondary hover:bg-secondary/10">
              Invite Signatory
            </button>
            {inviteOpen && (
              <div className="mt-3 flex gap-2">
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@company.com" className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm outline-none" />
                <button className="rounded-xl bg-primary px-4 py-2 text-sm">Send</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          disabled={isAnchoring}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            isAnchoring
              ? "cursor-not-allowed bg-gray-600 opacity-50"
              : "bg-gradient-to-r from-primary to-indigo-500 hover-glow-purple"
          }`}
        >
          <Download className="mr-2 inline h-4 w-4" /> Download Certificate
        </button>
        <button className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface2">
          <FileText className="mr-2 inline h-4 w-4" /> Export Audit Trail
        </button>
        <button
          onClick={() => router.push(`/verify?hash=${TAMPERED_HASH}`)}
          className="rounded-xl border border-red-400/40 px-4 py-2 text-xs text-red-300 hover:bg-red-500/10"
        >
          <AlertTriangle className="mr-2 inline h-4 w-4" /> Simulate Tampering
        </button>
      </div>
    </DashboardLayout>
  );
}
