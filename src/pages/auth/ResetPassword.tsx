import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Sparkles, Shield, Star, Eye, XCircle, CheckCircle } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/glass/GlassCard";
import api from "@/lib/axios";
import { errorMessage } from "@/lib/errors";
import { useToast } from "@/context/ToastProvider";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { addToast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      const msg = "Invalid or missing reset token";
      setError(msg);
      addToast(msg, "error");
      return;
    }
    try {
      setError("");
      await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setSuccess(true);
      addToast("Password reset successfully!", "success");
    } catch (err) {
      const msg = errorMessage(err, "Failed to reset password");
      setError(msg);
      addToast(msg, "error");
    }
  };

  if (!token && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="aurora-static pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="elevated" padding="lg" className="w-full border-gradient text-center">
            <GlassCardHeader>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-danger-500/10 border-danger-500/30 text-danger-400 text-xs font-medium mb-5">
                <Sparkles className="h-4 w-4" />
                <span className="uppercase tracking-[0.2em]">Invalid Link</span>
              </div>
              <GlassCardTitle className="text-heading-lg">Invalid Reset Token</GlassCardTitle>
              <GlassCardDescription>
                This password reset link is invalid or has expired.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <GlassButton
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => navigate("/forgot-password")}
              >
                Request New Link
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

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
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${success ? "bg-success-500/10 border-success-500/30 text-success-400" : "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"} text-xs font-medium mb-5`}>
              <Sparkles className="h-4 w-4" />
              <span className="uppercase tracking-[0.2em]">{success ? "Password Reset" : "New Password"}</span>
            </div>
            <GlassCardTitle className="text-heading-lg">
              {success ? "Password Updated" : "Set New Password"}
            </GlassCardTitle>
            <GlassCardDescription>
              {success
                ? "Your password has been successfully reset. You can now sign in."
                : "Enter your new password below. Make sure it's secure and memorable."}
            </GlassCardDescription>
          </GlassCardHeader>

          <AnimatePresence>
            {!success && error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="mb-5 p-3 rounded-xl glass border-danger-500/30 bg-danger-500/10 text-danger-400 text-sm flex items-center gap-2 animate-slide-in-up"
                role="alert"
              >
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <GlassCardContent>
            {!success ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <GlassInput
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  leadingIcon={<Lock className="h-4 w-4" />}
                  trailingIcon={
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="h-8 w-8 text-text-muted hover:text-text-primary"
                      aria-label="Toggle password visibility"
                    >
                      <Eye className="h-4 w-4" />
                    </GlassButton>
                  }
                  {...register("password")}
                  error={errors.password?.message}
                  autoComplete="new-password"
                />

                <GlassInput
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  leadingIcon={<Lock className="h-4 w-4" />}
                  trailingIcon={
                    <GlassButton
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="h-8 w-8 text-text-muted hover:text-text-primary"
                      aria-label="Toggle password visibility"
                    >
                      <Eye className="h-4 w-4" />
                    </GlassButton>
                  }
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />

                <GlassButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmitting}
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Reset Password
                </GlassButton>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success-500/15 text-success-400 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="text-text-secondary">
                  Your password has been successfully reset.
                </p>
                <GlassButton
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/login")}
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Sign In
                </GlassButton>
              </div>
            )}
          </GlassCardContent>

          <GlassCardFooter className="pt-4">
            <p className="text-center text-sm text-text-muted">
              Remember your password?{" "}
              <Link to="/login" className="text-accent-cyan hover:text-accent-blue font-medium transition-colors ml-1">
                Sign in
              </Link>
            </p>
          </GlassCardFooter>

          <div className="mt-6 pt-4 border-t border-glass-border/50">
            <div className="flex items-center justify-center gap-5 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-accent-cyan/60" />
                <span>Encrypted</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-glass-border" />
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-accent-cyan/40 text-accent-cyan/40" />
                <span>10,000+ teams</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-glass-border" />
              <span>99.9% uptime</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}