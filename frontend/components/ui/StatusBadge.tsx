"use client";

type Props = {
  status: "anchoring" | "confirmed" | "tampered";
};

const styleMap: Record<Props["status"], string> = {
  confirmed: "bg-emerald-500/15 text-secondary border border-secondary/30",
  anchoring: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
  tampered: "bg-red-500/15 text-red-300 border border-red-400/30",
};

const labelMap: Record<Props["status"], string> = {
  confirmed: "Confirmed",
  anchoring: "Anchoring",
  tampered: "Tampered",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${styleMap[status]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "confirmed"
            ? "bg-secondary"
            : status === "anchoring"
              ? "bg-amber-400 animate-pulse"
              : "bg-red-400 animate-pulse"
        }`}
      />
      {labelMap[status]}
    </span>
  );
}
