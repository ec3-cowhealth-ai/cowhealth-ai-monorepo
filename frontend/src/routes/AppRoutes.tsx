import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@components/ProtectedRoute";
import { LoginPage } from "@pages/auth/LoginPage";
import { LandingPage } from "@features/landing";

const DashboardPlaceholder = () => (
  <section>
    {/* TODO[IAN]: integrar componentes finais de dashboard e graficos */}
    <p>Dashboard em construcao.</p>
  </section>
);

const RegisterPlaceholder = () => (
  <section>
    {/* TODO[ANGELO]: implementar tela de registro de usuarios */}
    <p>Registro de usuarios em construcao.</p>
  </section>
);

const AppHomePlaceholder = () => (
  <section>
    {/* TODO[JAFTE]: integrar home e demais modulos de frontend */}
    <p>Home em construcao.</p>
  </section>
);

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPlaceholder />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<AppHomePlaceholder />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
