"use client";

import { motion } from "framer-motion";
import { Clock, ExternalLink, Globe, Layers } from "lucide-react";
import { formatDateTime, polygonscanTxUrl, truncateHash } from "@/lib/utils";

type Props = {
  txHash: string;
  blockNumber: number;
  network: string;
  anchoredAt: string;
  authentic: boolean;
};

export default function BlockchainProofCard({
  txHash,
  blockNumber,
  network,
  anchoredAt,
  authentic,
}: Props) {
  return (
    <div
      className={`glass-card rounded-2xl border-l-4 p-5 ${
        authentic ? "border-l-secondary" : "border-l-red-400"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <svg className="h-8 w-8" viewBox="0 0 24 24">
          <motion.path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke={authentic ? "#00D9A3" : "#f87171"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        </svg>
        <h3 className="font-semibold text-text">Verified on Blockchain</h3>
      </div>

      <div className="space-y-3 text-sm text-muted">
        <a className="flex items-center gap-2 hover:text-text" href={polygonscanTxUrl(txHash)} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" /> TX Hash: {truncateHash(txHash, 14)}
        </a>
        <p className="flex items-center gap-2">
          <Layers className="h-4 w-4" /> Block Number: {blockNumber.toLocaleString()}
        </p>
        <p className="flex items-center gap-2">
          <Globe className="h-4 w-4" /> Network: {network}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Anchored: {formatDateTime(anchoredAt)}
        </p>
      </div>
    </div>
  );
}
