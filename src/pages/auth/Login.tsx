import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Shield, Star, Globe, Eye, EyeOff, XCircle, Hexagon } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/glass/GlassCard";
import api, { API_BASE_URL } from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";
import { errorMessage } from "@/lib/errors";
import type { User } from "@/types/domain";
import { useToast } from "@/context/ToastProvider";

const loginPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const loginOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type LoginPasswordInput = z.infer<typeof loginPasswordSchema>;
type LoginOtpInput = z.infer<typeof loginOtpSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToast();
  const [error, setError] = useState("");
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<LoginPasswordInput>({
    resolver: zodResolver(loginPasswordSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isSubmittingOtp },
  } = useForm<LoginOtpInput>({
    resolver: zodResolver(loginOtpSchema),
  });

  const onPasswordLogin = async (data: LoginPasswordInput) => {
    try {
      setError("");
      const response = await api.post<{ data: User }>("/auth/login", data);
      login(response.data.data);
      addToast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = errorMessage(err, "Invalid email or password");
      setError(msg);
      addToast(msg, "error");
    }
  };

  const onOtpLogin = async (data: LoginOtpInput) => {
    try {
      setError("");
      const response = await api.post<{ data: { requestId: string } }>("/auth/login-otp", data);
      navigate("/verify-otp", {
        state: { email: data.email, requestId: response.data.data.requestId, purpose: "LOGIN" },
      });
      addToast("Login code sent to your email", "success");
    } catch (err) {
      const msg = errorMessage(err, "Failed to send OTP");
      setError(msg);
      addToast(msg, "error");
    }
  };

  const switchMethod = (newMethod: "password" | "otp") => {
    setError("");
    setMethod(newMethod);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-canvas" />
      <div className="aurora pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />

      <div className="relative flex w-full max-w-7xl mx-auto">
        {/* Left Panel - Brand/Marketing */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-6 lg:p-8 relative"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-md w-full text-center relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-4" aria-label="Nexus Home">
              <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-3 rounded-2xl">
                <Hexagon className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-text-primary">Nexus</span>
            </Link>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-[1.02]">
              Welcome back to <br />
              <span className="gradient-text">your workspace</span>
            </h1>

            <p className="text-base md:text-lg text-text-muted mb-6 max-w-md mx-auto leading-relaxed">
              Sign in to manage your organizations, projects, and teams with complete security and control.
            </p>

            {/* Features/Trust indicators */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Shield, label: "Encrypted", color: "accent-cyan" },
                { icon: Star, label: "10K+ Teams", color: "accent-blue" },
                { icon: Globe, label: "99.9% Uptime", color: "accent-indigo" },
              ].map((item) => (
<div key={item.label} className="glass rounded-xl p-2 border-glass-border/50 text-center">
  <div className={`bg-${item.color}/10 text-${item.color} inline-flex items-center justify-center w-8 h-8 rounded-lg mb-1.5`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-text-primary uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-text-muted">
              <span>New here?</span>
              <Link to="/signup" className="text-accent-cyan hover:text-accent-blue font-medium transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full lg:w-1/2 items-center justify-center p-3 lg:p-6"
        >
          <div className="w-full">
            <GlassCard variant="elevated" padding="md" className="w-full border-gradient">
              <GlassCardHeader className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-xs font-medium mb-3 lg:mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span className="uppercase tracking-[0.2em]">Welcome back</span>
                </div>
                <GlassCardTitle className="text-heading-md">Sign in to Nexus</GlassCardTitle>
                <GlassCardDescription>
                  Enter your credentials to access your workspace
                </GlassCardDescription>
              </GlassCardHeader>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="mb-3 p-2.5 rounded-xl glass border-danger-500/30 bg-danger-500/10 text-danger-400 text-sm flex items-center gap-2 animate-slide-in-up"
                    role="alert"
                  >
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <GlassCardContent className="space-y-3">
                {method === "password" ? (
                  <form onSubmit={handlePasswordSubmit(onPasswordLogin)} className="space-y-3">
                    <GlassInput
                      label="Email address"
                      type="email"
                      placeholder="you@example.com"
                      leadingIcon={<Mail className="h-4 w-4" />}
                      {...registerPassword("email")}
                      error={passwordErrors.email?.message}
                      autoComplete="email"
                    />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-text-secondary">Password</label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-accent-cyan hover:text-accent-blue font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <GlassInput
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        leadingIcon={<Lock className="h-4 w-4" />}
                        trailingIcon={
                          <GlassButton
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-8 w-8 text-text-muted hover:text-text-primary"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </GlassButton>
                        }
                        {...registerPassword("password")}
                        error={passwordErrors.password?.message}
                        autoComplete="current-password"
                      />
                    </div>

                    <GlassButton
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={isSubmittingPassword}
                      trailingIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Sign in
                    </GlassButton>

                    <div className="text-center lg:text-left">
                      <button
                        type="button"
                        onClick={() => switchMethod("otp")}
                        className="text-sm text-text-muted hover:text-accent-cyan font-medium transition-colors cursor-pointer"
                      >
                        Sign in with a one-time code instead
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit(onOtpLogin)} className="space-y-4">
                    <GlassInput
                      label="Email address"
                      type="email"
                      placeholder="you@example.com"
                      leadingIcon={<Mail className="h-4 w-4" />}
                      {...registerOtp("email")}
                      error={otpErrors.email?.message}
                      autoComplete="email"
                    />

                    <GlassButton
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={isSubmittingOtp}
                      trailingIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Send login code
                    </GlassButton>

                    <div className="text-center lg:text-left">
                      <button
                        type="button"
                        onClick={() => switchMethod("password")}
                        className="text-sm text-text-muted hover:text-accent-cyan font-medium transition-colors cursor-pointer"
                      >
                        Sign in with password instead
                      </button>
                    </div>
                  </form>
                )}
              </GlassCardContent>

              <div className="relative my-2 lg:my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-glass-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-canvas/50 text-text-muted">Or continue with</span>
                </div>
              </div>

              <GlassCardFooter className="pt-2">
                <GlassButton
                  type="button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => (window.location.href = `${API_BASE_URL}/auth/google`)}
                  leadingIcon={<Globe className="h-4.5 w-4.5" />}
                >
                  Continue with Google
                </GlassButton>
              </GlassCardFooter>

              <p className="mt-3 text-center lg:text-left text-sm text-text-muted">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-accent-cyan hover:text-accent-blue font-medium transition-colors ml-1">
                  Create one
                </Link>
              </p>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}