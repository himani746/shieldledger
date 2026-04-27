import { keccak256 } from "js-sha3";

export function truncateHash(hash: string, chars = 16): string {
  if (hash.length <= chars) return hash;
  return `${hash.slice(0, chars)}...`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const dt = new Date(iso);
  const date = dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} at ${time}`;
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function polygonscanTxUrl(txHash: string): string {
  return `https://mumbai.polygonscan.com/tx/${txHash}`;
}

export async function computeKeccak256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hash = keccak256(bytes);
  return `0x${hash}`;
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
