import { QueryClient } from "@tanstack/react-query";

// F-13: single query client factory; short staleTime for lists; no refetch on window focus
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
