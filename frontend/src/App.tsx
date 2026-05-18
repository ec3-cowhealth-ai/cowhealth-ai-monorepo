import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div className="p-8"><h1>Dashboard (TODO-&gt;[Colaborador])</h1></div>} />
        </Route>

        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute permission="Create User" />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/users" element={<div className="p-8"><h1>Gestão de Usuários (TODO-&gt;[Ângelo])</h1></div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);