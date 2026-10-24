import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hexagon, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import api from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";
import { useToast } from "@/context/useToast";
import type { User } from "@/types/domain";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const login = useAuthStore((s) => s.login);
  const exchangedRef = useRef(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const ticket = searchParams.get("ticket");
    const error = searchParams.get("error");

    if (error || !ticket) {
      const msg = error ? `Google login failed: ${error}` : "Authentication ticket missing";
      setErrorState(msg);
      addToast(msg, "error");
      setTimeout(() => {
        window.location.replace("/login");
      }, 3000);
      return;
    }

    const exchange = async () => {
      try {
        const response = await api.post<{ data: User }>("/auth/google/exchange", { ticket });
        const user = response.data?.data;
        if (user) {
          login(user);
        }
        addToast("Welcome back!", "success");

        // If opened as a popup with opener on same origin
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: "OAUTH_SUCCESS", user }, window.location.origin);
            window.close();
          } catch {
            /* ignore cross-origin opener errors */
          }
        }

        // Hard replace guarantees state sync, cookies active, and avoids React StrictMode navigation drops
        const redirect = searchParams.get("redirect") || "/dashboard";
        window.location.replace(redirect);
      } catch (err: unknown) {
        console.error("Google OAuth exchange failed:", err);
        let msg = "Failed to complete Google authentication. Please try again.";
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ) {
          msg = (err as { response?: { data?: { message?: string } } }).response!.data!.message!;
        }
        setErrorState(msg);
        addToast(msg, "error");
        setTimeout(() => {
          window.location.replace("/login");
        }, 3000);
      }
    };

    void exchange();
  }, [searchParams, addToast, login]);

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-canvas" />
      <div className="aurora pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-mesh opacity-30" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <GlassCard className="text-center p-6 sm:p-8">
          <div className="flex justify-center mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                errorState
                  ? "bg-danger-500/20 text-danger-400 shadow-danger-500/20"
                  : "bg-gradient-to-br from-accent-cyan to-accent-blue shadow-accent-cyan/20 text-canvas"
              }`}
            >
              {errorState ? <AlertCircle className="w-6 h-6 text-danger-400" /> : <Hexagon className="w-6 h-6" />}
            </div>
          </div>
          <GlassCardHeader className="p-0 mb-4">
            <GlassCardTitle className="text-xl">
              {errorState ? "Authentication Issue" : "Authenticating with Google"}
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="p-0 flex flex-col items-center gap-4">
            {errorState ? (
              <>
                <p className="text-sm text-text-muted">{errorState}</p>
                <p className="text-xs text-text-muted/70">Redirecting to sign in...</p>
                <Link to="/login" className="w-full mt-2">
                  <GlassButton variant="outline" className="w-full" leadingIcon={<ArrowLeft className="w-4 h-4" />}>
                    Return to Sign in
                  </GlassButton>
                </Link>
              </>
            ) : (
              <>
                <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
                <p className="text-sm text-text-muted">
                  Securing your session and redirecting to your workspace...
                </p>
              </>
            )}
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}
