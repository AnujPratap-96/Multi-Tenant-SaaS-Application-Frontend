import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Shield, Users, Globe, Hexagon } from "lucide-react";
import { GlassButton } from "@/components/glass/GlassButton";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/glass/GlassCard";
import api, { API_BASE_URL } from "@/lib/axios";
import { errorMessage } from "@/lib/errors";
import { useToast } from "@/context/useToast";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SignupInput = z.infer<typeof signupSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      setError("");
      const response = await api.post<{ data: { requestId: string; purpose: string } }>(
        "/auth/signup-otp",
        { email: data.email }
      );
      addToast("Verification code sent to your email", "success");
      navigate("/verify-otp", {
        state: {
          email: data.email,
          requestId: response.data.data.requestId,
          purpose: response.data.data.purpose,
        },
      });
    } catch (err) {
      const msg = errorMessage(err, "An error occurred during signup");
      setError(msg);
      addToast(msg, "error");
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <div className="aurora pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />

      <div className="relative flex h-full w-full max-w-7xl mx-auto">
        {/* Left Panel - Brand/Marketing */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-6 lg:p-8 relative"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-md w-full text-center relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-4" aria-label="Nexus Home">
              <div className="bg-gradient-to-br from-accent-cyan to-accent-blue p-3 rounded-2xl">
                <Hexagon className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-text-primary">Nexus</span>
            </Link>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-[1.02]">
              Create your <br />
              <span className="gradient-text">free account</span>
            </h1>

            <p className="text-base md:text-lg text-text-muted mb-6 max-w-md mx-auto leading-relaxed">
              Join thousands of teams building on Nexus. Complete data isolation, granular RBAC, and seamless project management.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 mb-8 max-w-md mx-auto">
              {[
                { icon: Shield, label: "Multi-tenant architecture with complete isolation" },
                { icon: Users, label: "Advanced RBAC for granular access control" },
                { icon: Globe, label: "Project & task management built-in" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-left p-3 glass rounded-xl border-glass-border/50 hover:border-accent-cyan/30 transition-colors"
                >
                  <div className="bg-accent-cyan/10 text-accent-cyan p-2 rounded-lg flex-shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-text-muted">
              <span>Already have an account?</span>
              <Link to="/login" className="text-accent-cyan hover:text-accent-blue font-medium transition-colors">
                Sign in
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
                  <span className="uppercase tracking-[0.2em]">Create Account</span>
                </div>
                <GlassCardTitle className="text-heading-md">Join Nexus</GlassCardTitle>
                <GlassCardDescription>
                  Enter your email to receive a verification code
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
                    <span className="flex-1">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <GlassCardContent className="space-y-3">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
                    Continue with Email
                  </GlassButton>
                </form>
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
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                </GlassButton>
              </GlassCardFooter>

              <p className="mt-3 text-center lg:text-left text-sm text-text-muted">
                Already have an account?{" "}
                <Link to="/login" className="text-accent-cyan hover:text-accent-blue font-medium transition-colors ml-1">
                  Sign in
                </Link>
              </p>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}