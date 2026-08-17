import { TenantProvider } from "@/features/tenant/tenantProvider";
import { AppRouter } from "@/routes";
import { ErrorBoundary } from "@/components/guards/ErrorBoundary";
import { ToastProvider } from "@/context/ToastProvider";

// F-18: single app shell — tenant boot wiring (F-02) + router + toasts.

export default function App() {
  return (
    <ToastProvider>
      <TenantProvider>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </TenantProvider>
    </ToastProvider>
  );
}
