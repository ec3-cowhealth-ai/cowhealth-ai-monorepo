import { QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@routes/AppRoutes";
import { queryClient } from "@/lib/queryClient";
import { FarmProvider } from "./context/FarmContext";

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <FarmProvider>
      <AppRoutes />
    </FarmProvider>
  </QueryClientProvider>
);
