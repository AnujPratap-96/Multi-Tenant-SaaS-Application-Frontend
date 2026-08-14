import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAcceptInvite } from "@/features/tenant/tenantQueries";
import { useAuthStore } from "@/features/auth/authStore";

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const { isAuthenticated } = useAuthStore();
  const accept = useAcceptInvite();

  useEffect(() => {
    if (!token) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/accept?token=${token}`, { replace: true });
      return;
    }
    accept.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Invalid invite link</h2>
          <p className="text-gray-500 text-sm">This invite link is missing or invalid.</p>
        </div>
      </div>
    );
  }

  if (accept.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-primary-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Accepting invite…</p>
        </div>
      </div>
    );
  }

  if (accept.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm p-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">You're in!</h2>
          <p className="text-gray-500 text-sm">You've successfully joined the organization.</p>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (accept.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm p-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold">Failed to accept invite</h2>
          <p className="text-gray-500 text-sm">
            {(accept.error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || "This invite may have expired or already been used."}
          </p>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="px-5 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
