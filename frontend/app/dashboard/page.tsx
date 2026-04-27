"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FilePlus2,
  FileText,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import UploadZone from "@/components/ui/UploadZone";
import { copyToClipboard, formatDate, polygonscanTxUrl, truncateHash } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [doneTx, setDoneTx] = useState<string | null>(null);
  const [doneDoc, setDoneDoc] = useState<any>(null);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await apiFetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        } else {
          toast.error("Failed to load documents.");
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        toast.error("Failed to load documents.");
      } finally {
        setLoadingDocuments(false);
      }
    };
    fetchDocuments();
  }, []);

  const onAnchor = async () => {
    console.log('Upload clicked');
    if (!file || !title.trim()) {
      toast.error("Please add a file and title.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());

      const res = await apiFetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Document created with ID:', data.document?.id);
        setDoneDoc(data.document);
        setDoneTx(data.document?.txHash || "Pending validation on chain");
        toast.success("Document anchored successfully");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {showDemoBanner && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
          <p>Live demo — documents anchored on Polygon Mumbai testnet · Press D on verify page for instant demo</p>
          <button onClick={() => setShowDemoBanner(false)} className="rounded-lg p-1 hover:bg-amber-500/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold">Good morning, {session?.user?.name || 'User'}</h2>
      <p className="mb-6 text-muted">{today}</p>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={FileText} label="Total Documents" value={documents.length} color="#6C63FF" />
        <MetricCard icon={CheckCircle} label="Confirmed On-Chain" value={documents.filter(d => d.status === "confirmed").length} color="#00D9A3" />
        <MetricCard icon={Clock} label="Pending Anchoring" value={documents.filter(d => d.status === "anchoring").length} color="#F59E0B" />
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
            {loadingDocuments ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted">
                  <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  <span className="mt-2 block text-sm">Loading documents...</span>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted">
                  No documents found.
                </td>
              </tr>
            ) : documents.map((doc, i) => (
              <motion.tr
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border-t border-border hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">{doc.title}</td>
                <td className="px-4 py-3 text-muted">{formatDate(doc.date)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={async () => {
                      await copyToClipboard(doc.hash);
                      toast.success("Hash copied");
                    }}
                    className="font-mono text-primary hover:underline"
                  >
                    {truncateHash(doc.hash, 16)}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-muted">
                    <button 
                      onClick={() => {
                        console.log('View clicked');
                        router.push(`/documents/${doc.id}`);
                      }}
                      className="rounded-lg p-1 hover:bg-surface2 hover:text-text"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1 hover:bg-surface2 hover:text-text">
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
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setShowModal(true)}
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
              <button onClick={() => setShowModal(false)}>
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            {!doneTx ? (
              <>
                <UploadZone onFileAccepted={setFile} />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title or reference name"
                  className="mt-4 w-full rounded-xl border border-border bg-surface2 px-3 py-2 outline-none focus:border-primary"
                />
                <button
                  onClick={onAnchor}
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-3 font-semibold transition hover-glow-purple"
                >
                  {loading ? "Anchoring..." : "Anchor to Blockchain"}
                </button>
                {loading && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface2">
                    <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-secondary" />
                <p className="mt-2 text-lg">Document anchored successfully</p>
                <p className="mt-2 font-mono text-sm text-primary">{doneTx}</p>
                <a href={polygonscanTxUrl(doneTx)} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-secondary hover:underline">
                  View on Polygonscan
                </a>
                <button 
                  onClick={() => {
                    if (doneDoc?.id) {
                      router.push(`/documents/${doneDoc.id}`);
                    } else if (doneDoc?.fileUrl || doneDoc?.s3Url) {
                      window.open(doneDoc.fileUrl || doneDoc.s3Url, '_blank');
                    }
                  }}
                  className="mt-4 w-full rounded-xl border border-border px-4 py-2 hover:bg-surface2"
                >
                  View Document
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
