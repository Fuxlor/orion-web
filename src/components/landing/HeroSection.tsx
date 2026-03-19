"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Terminal } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* Background effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(2,241,148,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 10%, rgba(146,65,200,0.07) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-10 px-4 py-1.5 rounded-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 13,
            color: "#e1fff3",
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#02f194",
              display: "inline-block",
              boxShadow: "0 0 8px #02f194",
            }}
          />
          Orion v1.0 is now live
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: "clamp(42px, 7vw, 84px)",
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: "-0.04em",
            marginBottom: 8,
            color: "white",
          }}
        >
          Ship with confidence.
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: "clamp(42px, 7vw, 84px)",
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: "-0.04em",
            marginBottom: 28,
            color: "#02f194",
          }}
        >
          Monitor with clarity.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: 18,
            color: "#9ba3af",
            lineHeight: 1.75,
            maxWidth: 520,
            margin: "0 auto 44px",
          }}
        >
          The ultimate logging and monitoring platform for modern Node.js applications.
          Real-time insights, zero configuration, infinite scalability.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(2,241,148,0.35)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 cursor-pointer"
              style={{
                backgroundColor: "#02f194",
                color: "#0d0f16",
                borderRadius: 11,
                padding: "15px 30px",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Get started for free <ArrowRight size={16} strokeWidth={2.5} />
            </motion.div>
          </Link>
          <Link href="/docs">
            <motion.div
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 11,
                padding: "15px 30px",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <Terminal size={15} style={{ color: "#02f194" }} />
              View documentation
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
