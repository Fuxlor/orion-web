"use client";

import { motion } from "motion/react";
import { Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Zap size={20} />,
    title: "Real-time Logging",
    description:
      "Capture every log event instantly with zero latency. Stream logs to your dashboard as they happen.",
    color: "#02f194",
  },
  {
    icon: <Shield size={20} />,
    title: "Error Monitoring",
    description:
      "Catch exceptions before your users do. Smart alerting with context, stack traces and frequency analysis.",
    color: "#9241c8",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Performance Insights",
    description:
      "Track response times, CPU usage and memory consumption across all your Node.js services.",
    color: "#02f194",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 46px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            marginBottom: 12,
            color: "white",
          }}
        >
          Everything you need to{" "}
          <span style={{ color: "#02f194" }}>ship faster</span>
        </h2>
        <p style={{ color: "#9ba3af", fontSize: 16, maxWidth: 460, margin: "0 auto" }}>
          Built for developers who care about reliability, performance and DX.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{
              y: -5,
              boxShadow: `0 20px 60px ${feat.color}14`,
            }}
            style={{
              backgroundColor: "#13161f",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: 28,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                backgroundColor: `${feat.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                color: feat.color,
              }}
            >
              {feat.icon}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "white" }}>
              {feat.title}
            </h3>
            <p style={{ fontSize: 14, color: "#9ba3af", lineHeight: 1.75 }}>
              {feat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
