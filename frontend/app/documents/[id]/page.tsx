"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clipboard, Download, ExternalLink, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BlockchainProofCard from "@/components/ui/BlockchainProofCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { TAMPERED_HASH } from "@/lib/mockData";
import { copyToClipboard, formatDate, formatDateTime, truncateHash } from "@/lib/utils";
import axios from "axios";

const doc = {
  title: "Supplier Contract Q1 2024",
  hash: "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d238ff944bacb478cb",
  txHash: "0x02073afeb4957cfc3cf0a4557629854f3d9d40b75bdd56ec",
  block: 42891234,
  network: "Polygon Mumbai",
  anchoredAt: "2024-01-15T10:23:45.000Z",
  versions: [
    { version: 1, hash: "0x3b4c...initial", date: "2024-01-15", note: "Original" },
    { version: 2, hash: "0x9f8e...updated", date: "2024-01-18", note: "Revised terms" },
  ],
  signatories: [
    { email: "raj.kumar@techcorp.com", signedAt: "2024-01-16T09:00:00Z" },
    { email: "priya.sharma@vendor.com", signedAt: "2024-01-17T14:30:00Z" },
  ],
};

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadCertificate = async () => {
    try {
      setIsDownloading(true);
      // Calls the real API endpoint with an auth header
      const res = await axios.get(`http://localhost:4000/api/documents/${params.id}/certificate`, {
        headers: {
          Authorization: `Bearer dummy-auth-token-for-demo`, // Replace with actual token
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download certificate");
    } finally {
      setIsDownloading(false);
    }
  };

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
              <p>Uploaded: {formatDate(doc.anchoredAt)}</p>
              <p>File type: PDF</p>
              <p>Owner org: TechCorp Pvt Ltd</p>
              <StatusBadge status="confirmed" />
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

          <BlockchainProofCard
            txHash={doc.txHash}
            blockNumber={doc.block}
            network={doc.network}
            anchoredAt={doc.anchoredAt}
            authentic
          />
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 font-semibold">Version History</h3>
            <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-primary/40">
              {doc.versions.map((v) => (
                <div key={v.version} className="relative pl-10">
                  <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs">{v.version}</span>
                  <p className="font-medium">v{v.version} · {v.note}</p>
                  <p className="text-sm text-muted">{v.hash}</p>
                  <p className="text-xs text-muted">{v.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-4 font-semibold">Signatories</h3>
            <div className="space-y-3">
              {doc.signatories.map((s) => (
                <div key={s.email} className="flex items-center justify-between rounded-xl border border-border bg-surface2/40 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs">
                      {s.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm">{s.email}</p>
                      <p className="text-xs text-muted">{formatDateTime(s.signedAt)}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                </div>
              ))}
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
          onClick={handleDownloadCertificate}
          disabled={isDownloading}
          className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 text-sm font-semibold hover-glow-purple disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Download className="mr-2 inline h-4 w-4" />
          )}
          {isDownloading ? "Downloading..." : "Download Certificate"}
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
