"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import VerificationResult from "@/components/verify/VerificationResult";
import UploadZone from "@/components/ui/UploadZone";
import { computeKeccak256 } from "@/lib/utils";

type VerifyStatus = "idle" | "loading" | "authentic" | "tampered";

export default function VerifyPage() {
  const [tab, setTab] = useState<"hash" | "upload">("hash");
  const [inputHash, setInputHash] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [result, setResult] = useState<{ owner: string; timestamp: string } | null>(null);

  const runVerify = async (hash: string) => {
    if (!hash.trim()) return;
    setStatus("loading");
    try {
      await new Promise((r) => setTimeout(r, 800));
      const res = await fetch(
        `/api/prototype/verify?hash=${encodeURIComponent(hash)}`
      );
      const data = await res.json();
      if (res.ok && data.authentic) {
        setResult({ owner: data.owner ?? "On-chain", timestamp: data.timestamp ?? new Date().toISOString() });
        setStatus("authentic");
      } else {
        setResult(null);
        setStatus("tampered");
      }
    } catch {
      setResult(null);
      setStatus("tampered");
    }
  };

  useEffect(() => {
    const hashFromQuery = new URLSearchParams(window.location.search).get("hash");
    if (hashFromQuery) setInputHash(hashFromQuery);
  }, []);

  const heading = useMemo(
    () => "Verify any document's authenticity instantly — no account required",
    [],
  );

  return (
    <div className="min-h-screen bg-background px-4 py-12 text-text">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 text-3xl font-bold">Document Verification</h1>
          <p className="mt-2 text-muted">{heading}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
          <div className="mb-4 inline-flex rounded-xl border border-border bg-surface2 p-1">
            <button onClick={() => setTab("hash")} className={`rounded-lg px-4 py-2 text-sm ${tab === "hash" ? "bg-primary text-white" : "text-muted"}`}>Paste Hash</button>
            <button onClick={() => setTab("upload")} className={`rounded-lg px-4 py-2 text-sm ${tab === "upload" ? "bg-primary text-white" : "text-muted"}`}>Upload File</button>
          </div>

          {tab === "hash" ? (
            <div>
              <textarea
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value.trim())}
                placeholder="0x3b4c5d6e7f8a9b0c..."
                className="h-28 w-full rounded-xl border border-border bg-surface2 p-3 font-mono text-sm outline-none focus:border-primary"
              />
              <button onClick={() => void runVerify(inputHash)} className="mt-3 w-full rounded-xl bg-gradient-to-r from-primary to-indigo-500 py-3 font-semibold hover-glow-purple">
                Verify Document
              </button>
            </div>
          ) : (
            <div>
              <UploadZone
                onFileAccepted={async (file) => {
                  const hash = await computeKeccak256(file);
                  setInputHash(hash);
                  await runVerify(hash);
                }}
              />
              <p className="mt-3 text-xs text-muted">
                Drop file to compute hash and verify. No file is uploaded.
              </p>
            </div>
          )}
        </motion.div>

        {status !== "idle" && (
          <VerificationResult
            status={status === "loading" ? "loading" : status === "authentic" ? "authentic" : "tampered"}
            hash={inputHash}
            details={result}
          />
        )}

        {status === "authentic" && (
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-xl bg-secondary/90 px-4 py-2 font-semibold text-surface hover:bg-secondary">
              Download Verification Report
            </button>
            <button onClick={() => setStatus("idle")} className="rounded-xl border border-border px-4 py-2">
              Verify Another
            </button>
          </div>
        )}
        {status === "tampered" && (
          <div className="mt-5 flex gap-3">
            <a href="/register" className="flex-1 rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-2 text-center font-semibold">
              Register Your Documents
            </a>
            <button onClick={() => setStatus("idle")} className="rounded-xl border border-border px-4 py-2">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
