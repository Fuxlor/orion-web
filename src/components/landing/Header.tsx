"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300`}
      style={{
        height: 60,
        backgroundColor: scrolled ? "rgba(13,15,22,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div
              className="flex items-center justify-center rounded-lg overflow-hidden"
              style={{ width: 30, height: 30, backgroundColor: "#02f194" }}
            >
              <Image
                src="/orion-nobg.png"
                alt="Orion"
                width={22}
                height={22}
                className="object-contain"
                style={{ filter: "brightness(0)" }}
              />
            </div>
            <span
              style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "white" }}
            >
              Orion
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Docs", href: "/docs" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-white"
                style={{ fontSize: 14, color: "#9ba3af", textDecoration: "none" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(2,241,148,0.4)" }}
                whileTap={{ scale: 0.96 }}
                className="cursor-pointer"
                style={{
                  backgroundColor: "#02f194",
                  color: "#0d0f16",
                  borderRadius: 9,
                  padding: "9px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Go to Dashboard
              </motion.div>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:block transition-colors hover:text-white"
                style={{ fontSize: 14, color: "#9ba3af", fontWeight: 500 }}
              >
                Login
              </Link>
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(2,241,148,0.4)" }}
                  whileTap={{ scale: 0.96 }}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: "#02f194",
                    color: "#0d0f16",
                    borderRadius: 9,
                    padding: "9px 18px",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Get Started
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
