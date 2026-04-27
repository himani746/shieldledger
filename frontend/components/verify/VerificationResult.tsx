"use client";

import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import { DEMO_HASH } from "@/lib/mockData";
import { truncateHash } from "@/lib/utils";

type Props = {
  status: "loading" | "authentic" | "tampered";
  hash?: string;
};

export default function VerificationResult({ status, hash }: Props) {
  if (status === "loading") {
    return (
      <div className="mt-6 text-center">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2 }}>
          <Shield className="mx-auto h-16 w-16 text-primary" />
        </motion.div>
        <p className="mt-3 text-text">Checking blockchain...</p>
        <motion.p
          className="text-muted"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2 }}
        >
          ...
        </motion.p>
      </div>
    );
  }

  const authentic = status === "authentic";
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 14 }}
      className="mt-6 text-center"
    >
      <div className={`${authentic ? "bg-secondary/20" : "bg-red-500/20"} mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full`}>
        {authentic ? (
          <ShieldCheck className="h-20 w-20 text-secondary" />
        ) : (
          <ShieldX className="h-20 w-20 text-red-400" />
        )}
      </div>
      <h2 className="text-3xl font-bold text-text">
        {authentic ? "Document Authentic" : "Document Not Found on Ledger"}
      </h2>
      <p className="mt-2 text-muted">
        {authentic
          ? "This document is registered and unmodified"
          : "This document has not been registered with ShieldLedger, or its contents have been modified after registration."}
      </p>

      <div
        className={`glass-card mt-5 rounded-2xl border-l-4 p-4 text-left ${
          authentic ? "border-l-secondary" : "border-l-red-400"
        }`}
      >
        {authentic ? (
          <div className="space-y-2 text-sm text-muted">
            <p>Registered by: TechCorp Pvt Ltd</p>
            <p>Anchored: January 15, 2024 at 10:23 AM</p>
            <p>Blockchain TX: 0x02073a...</p>
            <p>Block: 42,891,234</p>
            <p>Network: Polygon Mumbai</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted">
            <p className="font-mono">Hash checked: {truncateHash(hash ?? DEMO_HASH, 26)}</p>
            <p>No matching record found on Polygon Mumbai</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
