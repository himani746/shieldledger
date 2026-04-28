'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthBannerProps {
  onLogin?: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ onLogin }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="sticky top-0 z-40 glass-card m-4 border-secondary/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <p className="text-foreground font-medium">ShieldLedger Access</p>
            <p className="text-muted-foreground text-sm">Sign in with your registered organization account.</p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};
