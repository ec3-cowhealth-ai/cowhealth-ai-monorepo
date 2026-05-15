import { QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@routes/AppRoutes";
import { queryClient } from "@/lib/queryClient";

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppRoutes />
  </QueryClientProvider>
);
