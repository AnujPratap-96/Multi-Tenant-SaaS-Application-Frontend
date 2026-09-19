import { QueryClient } from "@tanstack/react-query";

// F-13: single query client instance, shared across the app so that
// tenant switching can invalidate everything at once (C7).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Keep the factory for tests / isolated usage.
export const createQueryClient = () => queryClient;
