"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { copyToClipboard, truncateHash } from "@/lib/utils";

type Props = {
  hash: string;
  truncate?: boolean;
};

export default function HashDisplay({ hash, truncate = false }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await copyToClipboard(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex items-center justify-between gap-3 rounded-xl border border-border bg-surface2/60 px-3 py-2">
      <span className="shimmer-text break-all font-mono text-sm text-primary">
        {truncate ? truncateHash(hash, 16) : hash}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="relative rounded-lg p-2 text-muted transition hover:bg-primary/20 hover:text-text"
      >
        {copied ? <Check className="h-4 w-4 text-secondary" /> : <Clipboard className="h-4 w-4" />}
        <span className="pointer-events-none absolute -top-8 right-0 hidden rounded-md bg-surface px-2 py-1 text-xs text-text group-hover:block">
          {copied ? "Copied!" : "Copy"}
        </span>
      </button>
    </div>
  );
}
