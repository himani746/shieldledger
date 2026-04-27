'use client';

import { motion } from 'framer-motion';
import { Button } from './Button';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary/20 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            ShieldLedger
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Blockchain-verified document authentication with cryptographic proof of authenticity
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/register">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/verify">
            <Button variant="outline" size="lg">
              Verify Document
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: '⚡', label: 'Instant Verification', desc: 'Verify documents in seconds' },
            { icon: '🔐', label: 'Cryptographically Secure', desc: 'SHA-3 hashing with blockchain proof' },
            { icon: '🌐', label: 'Tamper Detection', desc: 'Detect any document modifications' },
          ].map((feature, i) => (
            <div key={i} className="glass p-6 rounded-lg hover:bg-white/15 transition-all">
              <div className="text-4xl mb-2">{feature.icon}</div>
              <h3 className="font-bold text-foreground mb-2">{feature.label}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
