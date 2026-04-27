"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
};

export default function MetricCard({ icon: Icon, label, value, color }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 700;
    const step = Math.max(1, Math.floor(value / 30));
    const id = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= value) {
          clearInterval(id);
          return value;
        }
        return prev + step;
      });
    }, duration / 30);
    return () => clearInterval(id);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border-b-2 p-5"
      style={{ borderBottomColor: color }}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-3xl font-bold text-text">{count}</p>
      <p className="text-sm text-muted">{label}</p>
    </motion.div>
  );
}
