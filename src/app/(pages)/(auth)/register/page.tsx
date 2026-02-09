"use client";

import { useState } from "react";
import Link from "next/link";

const BULLET = "•";
const STEPS = 2;

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
    // TODO: wire to auth API
    console.log({ firstName, lastName, pseudo, email, password });
  }

  function handleBack() {
    setStep(1);
    setPasswordError("");
  }

  const isStep1 = step === 1;

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-6">
      <div className="w-full max-w-[24rem] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight m-0 mb-1">
          Orion
        </h1>
        <p className="text-[var(--text-muted)] text-sm text-center m-0 mb-2">
          {isStep1 ? "Tell us about you" : "Create your account"}
        </p>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-6 bg-[var(--primary)]"
                  : s < step
                    ? "w-1.5 bg-[var(--primary)]"
                    : "w-1.5 bg-[var(--border)]"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <form onSubmit={handleStepNext} className="flex flex-col gap-4">
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

          <div className="flex gap-3 mt-2">
            {!isStep1 && (
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-5 rounded-lg font-medium text-[var(--text-secondary)] bg-[var(--surface-input)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors cursor-pointer text-base"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-lg font-semibold text-[var(--surface)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors border-0 cursor-pointer text-base"
            >
              {isStep1 ? "Next" : "Create account"}
            </button>
          </div>
        </form>

        <p className="text-[var(--text-muted)] text-sm text-center m-0 mt-5">
          Already have an account? <Link href="/login" className="text-[var(--primary)] underline hover:no-underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
