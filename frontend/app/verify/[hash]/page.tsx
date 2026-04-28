"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VerificationResult from "@/components/verify/VerificationResult";
import { Shield } from "lucide-react";

export default function VerifyHashPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [status, setStatus] = useState<"loading" | "authentic" | "tampered">("loading");
  const [details, setDetails] = useState<{ owner: string; timestamp: string } | null>(null);

  useEffect(() => {
    async function fetchVerification() {
      try {
        const res = await fetch(
          `/api/prototype/verify?hash=${encodeURIComponent(hash)}`
        );
        const data = await res.json();
        if (res.ok && data.authentic) {
          setDetails({ owner: data.owner ?? "On-chain", timestamp: data.timestamp ?? new Date().toISOString() });
          setStatus("authentic");
        } else {
          setStatus("tampered");
        }
      } catch {
        setStatus("tampered");
      }
    }

    if (hash) {
      fetchVerification();
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background px-4 py-12 text-text relative">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 text-3xl font-bold">Document Verification</h1>
          <p className="mt-2 text-muted">Verify any document's authenticity instantly</p>
        </div>

        <VerificationResult
          status={status}
          hash={hash}
          details={details}
        />
      </div>
    </div>
  );
}
