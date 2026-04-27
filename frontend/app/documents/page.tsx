"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HashDisplay from "@/components/ui/HashDisplay";
import StatusBadge from "@/components/ui/StatusBadge";
import { MOCK_DOCUMENTS } from "@/lib/mockData";
import { formatDate, polygonscanTxUrl } from "@/lib/utils";

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">My Documents</h2>
          <p className="text-sm text-muted">
            Review anchored files and audit status across your organization.
          </p>
        </div>
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:bg-surface2 hover:text-text"
        >
          <Search className="h-4 w-4" />
          Quick Verify
        </Link>
      </div>

      <div className="grid gap-4">
        {MOCK_DOCUMENTS.map((doc, index) => (
          <motion.article
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Link
                  href={`/documents/${doc.id}`}
                  className="inline-flex items-center gap-2 text-lg font-semibold text-text hover:text-primary"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  {doc.title}
                </Link>
                <p className="mt-1 text-sm text-muted">Uploaded on {formatDate(doc.date)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={doc.status} />
                <HashDisplay hash={doc.hash} truncate />
                {doc.txHash ? (
                  <a
                    href={polygonscanTxUrl(doc.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface2 hover:text-text"
                  >
                    TX
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="rounded-lg border border-border px-3 py-2 text-xs text-muted">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </DashboardLayout>
  );
}
