import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Hexagon, Loader2 } from "lucide-react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/glass/GlassCard";
import api from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";
import { useToast } from "@/context/useToast";
import type { User } from "@/types/domain";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const login = useAuthStore((s) => s.login);
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const ticket = searchParams.get("ticket");
    const error = searchParams.get("error");

    if (error || !ticket) {
      addToast(error ? `Google login failed: ${error}` : "Authentication ticket missing", "error");
      navigate("/login", { replace: true });
      return;
    }

    const exchange = async () => {
      try {
        const response = await api.post<{ data: User }>("/auth/google/exchange", { ticket });
        const user = response.data.data;
        login(user);
        addToast("Welcome back!", "success");

        // If opened as a popup with opener on same origin
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: "OAUTH_SUCCESS", user }, window.location.origin);
            window.close();
            return;
          } catch {
            /* ignore cross-origin opener errors */
          }
        }

        navigate("/dashboard", { replace: true });
      } catch {
        addToast("Failed to complete Google authentication. Please try again.", "error");
        navigate("/login", { replace: true });
      }
    };

    void exchange();
  }, [searchParams, navigate, addToast, login]);

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center shadow-lg shadow-accent-cyan/20">
              <Hexagon className="w-6 h-6 text-canvas" />
            </div>
          </div>
          <GlassCardHeader className="p-0 mb-4">
            <GlassCardTitle className="text-xl">Authenticating with Google</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="p-0 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
            <p className="text-sm text-text-muted">
              Securing your session and redirecting to your workspace...
            </p>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}
