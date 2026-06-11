"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import {
  sendEmailOTP,
  verifyEmailOTP,
  getGoogleAuthUrl,
} from "@/lib/customerApi";
import { useCustomer } from "@/context/CustomerContext";
import clsx from "clsx";

type Step = "email" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, isAuthenticated } = useCustomer();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) router.replace("/account");
  }, [isAuthenticated, router]);

  // Show error from Google OAuth failure redirect
  useEffect(() => {
    const err = params.get("error");
    if (err) {
      let errorMsg = "";
      if (err === "google_failed") {
        errorMsg = "Google sign-in failed. Please try again.";
      } else if (err === "server_error") {
        errorMsg = "Something went wrong. Please try again.";
      } else if (err === "google_not_configured") {
        errorMsg =
          "Google login is not set up yet. Please use email OTP to sign in.";
      }
      if (errorMsg) {
        const handleSetError = () => setError(errorMsg);
        handleSetError();
      }
    }
  }, [params]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendEmailOTP(email.trim().toLowerCase());
      setStep("otp");
      setResendTimer(60);
      // Focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value.slice(-1); // take last char
    setOtp(updated);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyEmailOTP(email, code);
      login(res.token, res.customer);
      router.replace("/account");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again.",
      );
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await sendEmailOTP(email);
      setResendTimer(60);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card-hover p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            {/* <div className="w-14 h-14 bg-linear-to-r from-coral to-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-3xl bg-white rounded-lg p-1">
                <Shapes className="text-coral-dark" />
              </span>
            </div> */}
            <h1 className="font-display text-2xl font-bold text-brand-navy">
              {step === "email" ? "Welcome back!" : "Check your email"}
            </h1>
            <p className="text-brand-light-gray text-sm mt-1.5">
              {step === "email"
                ? "Sign in or create an account"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* ── Step 1: Email ─────────────────────────────────────────── */}
          {step === "email" && (
            <>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light-gray"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="input-field pl-11"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loading ? "Sending OTP…" : "Continue with Email"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-brand-light-gray">
                    or
                  </span>
                </div>
              </div>

              {/* Google */}
              <a
                href={getGoogleAuthUrl()}
                className={clsx(
                  "w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 border-gray-200",
                  "font-semibold text-brand-navy hover:border-teal hover:bg-teal/5 transition-all duration-200",
                )}
              >
                {/* Google SVG */}
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </a>

              <p className="text-center text-xs text-brand-light-gray mt-6">
                By continuing you agree to our{" "}
                <a href="/policy/terms" className="text-coral hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="/policy/privacy"
                  className="text-coral hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────────────── */}
          {step === "otp" && (
            <>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* 6 OTP boxes */}
                <div
                  className="flex justify-center gap-3"
                  onPaste={handleOTPPaste}
                >
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(i, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(i, e)}
                      disabled={loading}
                      className={clsx(
                        "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
                        "bg-gray-50 text-brand-navy",
                        digit
                          ? "border-coral shadow-sm"
                          : "border-gray-200 focus:border-teal",
                      )}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : null}
                  {loading ? "Verifying…" : "Verify & Sign In"}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="inline-flex items-center gap-1.5 text-sm text-brand-light-gray hover:text-coral disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <RefreshCw size={14} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>

              {/* Back */}
              <button
                onClick={() => {
                  setStep("email");
                  setError("");
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-brand-light-gray hover:text-brand-navy transition-colors"
              >
                <ArrowLeft size={14} />
                Use a different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
