"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VerificationResult from "@/components/verify/VerificationResult";
import axios from "axios";
import { Shield } from "lucide-react";

export default function VerifyHashPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [status, setStatus] = useState<"loading" | "authentic" | "tampered">("loading");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchVerification() {
      try {
        const res = await axios.get(`http://localhost:4000/api/documents/verify?hash=${hash}`);
        if (res.data) {
          setData(res.data);
          setStatus("authentic");
        } else {
          setStatus("tampered");
        }
      } catch (error) {
        setStatus("tampered");
      }
    }

    if (hash) {
      // Hardcode initial demo data behavior
      if (hash === "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d238ff944bacb478cb") {
        setTimeout(() => {
          setStatus("authentic");
        }, 1500);
      } else {
        fetchVerification();
      }
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
          // The VerificationResult component uses hardcoded dummy data for Authentic state currently.
          // Once the API returns real data, VerificationResult will be updated to display it.
        />
        
        {/* Task 7: Hidden Demo Toggle */}
        <button
          onClick={() => setStatus("tampered")}
          className="absolute bottom-4 right-4 h-4 w-4 opacity-5 hover:opacity-100 focus:outline-none"
          title="Force Tampered State (Demo)"
        />
      </div>
    </div>
  );
}
