import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, Sparkles, Shield, Star, CheckCircle, XCircle } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/glass/GlassCard";
import api from "@/lib/axios";
import { errorMessage } from "@/lib/errors";
import { useToast } from "@/context/ToastProvider";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setError("");
      await api.post("/auth/forgot-password", data);
      setSuccess(true);
      addToast("Reset link sent to your email", "success");
    } catch (err) {
      const msg = errorMessage(err, "Failed to send reset link");
      setError(msg);
      addToast(msg, "error");
    }
  };

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
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-glass-border/50 hover:border-accent-cyan/30 transition-colors mb-5"
              aria-label="Back to login"
            >
              <ArrowLeft className="h-4 w-4 text-text-muted" />
            </Link>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${success ? "bg-success-500/10 border-success-500/30 text-success-400" : "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan"} text-xs font-medium mb-5`}>
              <Sparkles className="h-4 w-4" />
              <span className="uppercase tracking-[0.2em]">{success ? "Email Sent" : "Reset Password"}</span>
            </div>
            <GlassCardTitle className="text-heading-lg">
              {success ? "Check Your Inbox" : "Forgot Password?"}
            </GlassCardTitle>
            <GlassCardDescription>
              {success
                ? "We've sent a password reset link to your email address."
                : "Enter your email and we'll send you a reset link."}
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
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  leadingIcon={<Mail className="h-4 w-4" />}
                  {...register("email")}
                  error={errors.email?.message}
                  autoComplete="email"
                />

                <GlassButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmitting}
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Send Reset Link
                </GlassButton>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success-500/15 text-success-400 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="text-text-secondary">
                  If an account exists for that email, you'll receive a
                  password reset link shortly.
                </p>
                <p className="text-sm text-text-muted">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <GlassButton
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setSuccess(false)}
                >
                  Try Another Email
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