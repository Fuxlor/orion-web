"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-28 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            marginBottom: 16,
            color: "white",
          }}
        >
          Ready to monitor with{" "}
          <span style={{ color: "#02f194" }}>confidence?</span>
        </h2>
        <p style={{ color: "#9ba3af", fontSize: 16, marginBottom: 36 }}>
          Join thousands of developers shipping better, faster.
        </p>
        <Link href="/register">
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(2,241,148,0.4)" }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2.5 cursor-pointer"
            style={{
              backgroundColor: "#02f194",
              color: "#0d0f16",
              borderRadius: 12,
              padding: "16px 36px",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            Get started for free <ArrowRight size={18} strokeWidth={2.5} />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
}
