import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  XCircle,
  Clock,
  Shield,
  Star,
} from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
} from "@/components/glass/GlassCard";
import api from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";
import { errorMessage } from "@/lib/errors";
import { useToast } from "@/context/useToast";

const RESEND_COOLDOWN = 60;

type OtpPurpose = "SIGNUP" | "LOGIN" | "FORGOT_PASSWORD";

const RESEND_ENDPOINTS: Record<OtpPurpose, string> = {
  SIGNUP: "/auth/signup-otp",
  LOGIN: "/auth/login-otp",
  FORGOT_PASSWORD: "/auth/forgot-password-otp",
};

const VERIFY_ENDPOINTS: Record<OtpPurpose, (r: string, p: string) => string> = {
  SIGNUP: (r, p) => `/auth/verify-otp-signup?requestId=${r}&purpose=${p}`,
  LOGIN: (r, p) => `/auth/verify-otp-login?requestId=${r}&purpose=${p}`,
  FORGOT_PASSWORD: (r, p) => `/auth/verify-otp-forgot-password?requestId=${r}&purpose=${p}`,
};

const NAV_ON_SUCCESS: Record<OtpPurpose, string> = {
  SIGNUP: "/set-password",
  LOGIN: "/dashboard",
  FORGOT_PASSWORD: "/reset-password",
};

const PURPOSE_LABELS: Record<OtpPurpose, { badge: string; title: string }> = {
  SIGNUP: { badge: "Account Setup", title: "Verify Your Email" },
  LOGIN: { badge: "Security Check", title: "Two-Factor Authentication" },
  FORGOT_PASSWORD: { badge: "Password Reset", title: "Verify Reset Code" },
};

interface VerifyOtpState {
  email: string;
  purpose: OtpPurpose;
  requestId: string;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const state = (location.state as VerifyOtpState | null) ?? null;

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (!state?.email || !state?.purpose || !state?.requestId) {
    return <Navigate to="/login" replace />;
  }

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    // Handle single character
    const char = cleanValue.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-advance focus
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasteData[i] || "";
    }
    setDigits(nextDigits);

    const focusIdx = Math.min(pasteData.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const otpCode = digits.join("");
  const isComplete = otpCode.length === 6 && /^\d{6}$/.test(otpCode);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      const endpoint = VERIFY_ENDPOINTS[state.purpose](state.requestId, state.purpose);
      const response = await api.post<{ data: unknown }>(endpoint, { otp: otpCode });

      if (state.purpose === "LOGIN" && response.data?.data) {
        await useAuthStore.getState().login(response.data.data as never);
      }

      addToast("Code verified successfully!", "success");
      navigate(NAV_ON_SUCCESS[state.purpose]);
    } catch (err) {
      const message = errorMessage(err, "Invalid or expired verification code");
      setError(message);
      addToast(message, "error");
      // Select all or focus first on error
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    try {
      setResending(true);
      setError("");
      const endpoint = RESEND_ENDPOINTS[state.purpose];
      const res = await api.post<{ data?: { requestId?: string } }>(endpoint, {
        email: state.email,
      });
      const newRequestId = res.data?.data?.requestId;
      if (newRequestId) {
        window.history.replaceState(
          { ...state, requestId: newRequestId },
          "",
          location.pathname
        );
      }
      setCooldown(RESEND_COOLDOWN);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      addToast("A fresh verification code has been sent", "success");
    } catch (err) {
      const msg = errorMessage(err, "Failed to resend code");
      setError(msg);
      addToast(msg, "error");
    } finally {
      setResending(false);
    }
  };

  const backLink = state.purpose === "SIGNUP" ? "/signup" : "/login";
  const { badge, title } = PURPOSE_LABELS[state.purpose];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="aurora-static pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard variant="elevated" padding="lg" className="w-full border-gradient">
          <GlassCardHeader className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-medium mb-3">
              <ShieldCheck className="h-4 w-4" />
              <span className="uppercase tracking-[0.2em]">{badge}</span>
            </div>

            <GlassCardTitle className="text-heading-lg">{title}</GlassCardTitle>
            <GlassCardDescription className="mt-2 text-sm text-text-secondary">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-text-primary block mt-0.5">{state.email}</span>
            </GlassCardDescription>
          </GlassCardHeader>

          <GlassCardContent className="space-y-6 pt-2">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm flex items-center gap-2.5"
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* Segmented 6-digit input */}
              <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl bg-surface/70 border border-glass-border focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/30 outline-none text-text-primary transition-all duration-200 shadow-sm"
                  />
                ))}
              </div>

              <GlassButton
                type="submit"
                className="w-full"
                size="lg"
                disabled={!isComplete || isSubmitting}
                isLoading={isSubmitting}
                trailingIcon={<ArrowRight className="h-4 w-4" />}
              >
                Verify Code
              </GlassButton>
            </form>

            <div className="text-center pt-2 space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="inline-flex items-center gap-2 text-sm text-accent-cyan hover:text-accent-blue font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {cooldown > 0 ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span>Resend in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{resending ? "Sending fresh code…" : "Resend verification code"}</span>
                  </>
                )}
              </button>
            </div>
          </GlassCardContent>

          <GlassCardFooter className="pt-4 border-t border-glass-border/50">
            <p className="w-full text-center text-sm text-text-muted">
              <Link
                to={backLink}
                className="inline-flex items-center gap-1.5 text-accent-cyan hover:text-accent-blue font-medium transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to {state.purpose === "SIGNUP" ? "Sign up" : "Sign in"}</span>
              </Link>
            </p>
          </GlassCardFooter>

          <div className="mt-6 pt-4 border-t border-glass-border/50">
            <div className="flex items-center justify-center gap-5 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-accent-cyan/60" />
                <span>Protected</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-glass-border" />
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-accent-cyan/40 text-accent-cyan/40" />
                <span>Multi-tenant isolation</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
