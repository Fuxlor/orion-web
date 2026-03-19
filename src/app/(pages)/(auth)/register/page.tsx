"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "@/lib/api";

const BULLET = "•";

function maskPassword(password: string): string {
  if (password.length === 0) return "";
  return BULLET.repeat(password.length - 1) + password.slice(-1);
}

function passwordFromDisplay(prevPassword: string, display: string): string {
  const prevLen = prevPassword.length;
  const newLen = display.length;
  if (newLen > prevLen) return prevPassword + display.slice(prevLen);
  if (newLen < prevLen) return prevPassword.slice(0, newLen);
  return prevPassword.slice(0, -1) + display.slice(-1);
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      window.location.href = "/dashboard";
    }
  }, []);

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword((prev) => passwordFromDisplay(prev, e.target.value));
    if (passwordError) setPasswordError("");
  }

  function handleConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword((prev) => passwordFromDisplay(prev, e.target.value));
    if (passwordError) setPasswordError("");
  }

  function handleStepNext(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    // step 2 submit
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordError("");
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, pseudo, email, password }),
    }).then(res => res.json()).then(data => {
      if (data.error) {
        setError(data.message);
      } else {
        setError("");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      }
    }).catch(err => {
      setError("An error occurred: " + err.message);
    });
  }

  function handleBack() {
    setStep(1);
    setPasswordError("");
  }

  const isStep1 = step === 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0d0f16", backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(2,241,148,0.07) 0%, transparent 60%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[24rem] p-8 rounded-[18px] shadow-2xl"
        style={{ backgroundColor: "#13161f", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center justify-center rounded-[12px] mb-3" style={{ width: 44, height: 44, backgroundColor: "#02f194" }}>
            <Image src="/orion-nobg.png" alt="Orion" width={64} height={64} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight m-0 mb-1">Create account</h1>
          <p className="text-sm m-0" style={{ color: "#6b7280" }}>
            {isStep1 ? "Tell us about you" : "Set up your credentials"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: s === step ? 24 : 6,
                backgroundColor: s <= step ? "#02f194" : "rgba(255,255,255,0.1)",
              }}
              aria-hidden
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            initial={{ opacity: 0, x: isStep1 ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isStep1 ? 16 : -16 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleStepNext}
            className="flex flex-col gap-4"
          >
            {isStep1 ? (
              <>
                <label htmlFor="firstName" className="text-sm font-medium text-[var(--text-secondary)]">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                  className="w-full"
                />

                <label htmlFor="lastName" className="text-sm font-medium text-[var(--text-secondary)]">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                  className="w-full"
                />

                <label htmlFor="pseudo" className="text-sm font-medium text-[var(--text-secondary)]">
                  Pseudo
                </label>
                <input
                  id="pseudo"
                  type="text"
                  placeholder="janedoe"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full"
                />
              </>
            ) : (
              <>
                <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full"
                />

                <label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <input
                  id="password"
                  type="text"
                  inputMode="text"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={maskPassword(password)}
                  onChange={handlePasswordChange}
                  required
                  className="w-full font-mono"
                />

                <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-secondary)]">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="text"
                  inputMode="text"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={maskPassword(confirmPassword)}
                  onChange={handleConfirmChange}
                  required
                  className="w-full font-mono"
                />
                {passwordError && (
                  <p className="text-sm text-red-400 m-0 -mt-2" role="alert">
                    {passwordError}
                  </p>
                )}
              </>
            )}

            {error && (
              <p className="text-sm text-red-400 m-0 -mt-2" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              {!isStep1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-3 px-5 rounded-lg font-medium transition-colors cursor-pointer text-base"
                  style={{ color: "#9ba3af", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-5 rounded-lg font-semibold transition-colors border-0 cursor-pointer text-base"
                style={{ backgroundColor: "#02f194", color: "#0d0f16" }}
              >
                {isStep1 ? "Next" : "Create account"}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>

        <p className="text-sm text-center m-0 mt-5" style={{ color: "#6b7280" }}>
          Already have an account? <Link href="/login" className="hover:no-underline underline" style={{ color: "#02f194" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
