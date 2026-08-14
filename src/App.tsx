import { Toaster } from "sonner";
import { TenantProvider } from "@/features/tenant/tenantProvider";
import { AppRouter } from "@/routes";
import { ErrorBoundary } from "@/components/guards/ErrorBoundary";

// F-18: single app shell — tenant boot wiring (F-02) + router + toasts.

export default function App() {
  return (
    <TenantProvider>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </TenantProvider>
  );
}
