import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import api from "../../lib/axios";
import { useAuthStore } from "../../features/auth/authStore";
import { errorMessage } from "../../lib/errors";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

type OtpInput = z.infer<typeof otpSchema>;

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

interface VerifyOtpState {
  email: string;
  purpose: OtpPurpose;
  requestId: string;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as VerifyOtpState | null) ?? null;
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpInput>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!state?.email || !state?.purpose || !state?.requestId) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (data: OtpInput) => {
    try {
      setError("");
      const endpoint = VERIFY_ENDPOINTS[state.purpose](state.requestId, state.purpose);
      const response = await api.post<{ data: unknown }>(endpoint, { otp: data.otp });

      if (state.purpose === "LOGIN") {
        if (response.data.data) {
          await useAuthStore.getState().login(response.data.data as never);
        }
      }
      navigate(NAV_ON_SUCCESS[state.purpose]);
    } catch (err) {
      const message = errorMessage(err, "Invalid or expired OTP");
      if (message) {
        setError(message);
      } else {
        console.error("OTP verification error:", err);
        setError("Invalid or expired OTP");
      }
    }
  };

  const handleResend = async () => {
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
    } catch (err) {
      setError(errorMessage(err, "Failed to resend code"));
    } finally {
      setResending(false);
    }
  };

  const backLink = state.purpose === "SIGNUP" ? "/signup" : "/login";

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Check your email</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{state.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-center">
            Verification Code
          </label>
          <Input
            type="text"
            maxLength={6}
            autoFocus
            className="text-center text-2xl tracking-widest"
            placeholder="000000"
            {...register("otp")}
            error={errors.otp?.message}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Verify Code
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {resending ? "Resending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>

        <div>
          <Link
            to={backLink}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            ← Back to {state.purpose === "SIGNUP" ? "sign up" : "login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
