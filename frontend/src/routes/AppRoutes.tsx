import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@components/ProtectedRoute";
import { LoginPage } from "@pages/auth/LoginPage";
import { RegisterPage } from "@pages/auth/RegisterPage";
import { LandingPage } from "@features/landing";
import { DashboardPreviewPage } from "@features/landing/pages/DashboardPreviewPage";
import { MapPage } from "@pages/map/MapPage";
import { ProfilePage } from "@pages/profile/ProfilePage";
import { SettingsPage } from "@pages/settings/SettingsPage";
import { DashboardPage } from "@features/dashboard/pages/DashboardPage";
import { FarmsPage, FarmDetailPage } from "@features/farms";
import { CollarsPage, CollarDetailPage } from "@features/collars";
import { NotificationsPage } from "@features/notifications";
import { CowsPage, CowDetailPage, CowHistoryPage } from "@features/cows";
import {
  ClinicalRecordListPage,
  ClinicalRecordFormPage,
  ClinicalRecordDetailPage,
} from "@features/clinicalRecord";
import { AccessLayout, UsersPage, RolesPage, PermissionsPage } from "@features/access";
import { SplashPage } from "@pages/splash/SplashPage";
import { OnboardingPage } from "@pages/onboarding/OnboardingPage";
import { useMe } from "@hooks/useAuth";

const AppRoutesInner = () => {
  const { isLoading: isLoadingAuth } = useMe();
  if (isLoadingAuth) return <SplashPage />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/preview" element={<DashboardPreviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Farms */}
        <Route path="/farms" element={<FarmsPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />

        {/* Collars */}
        <Route path="/collars" element={<CollarsPage />} />
        <Route path="/collars/:id" element={<CollarDetailPage />} />

        {/* Cows */}
        <Route path="/cows" element={<CowsPage />} />
        <Route path="/cows/:id" element={<CowDetailPage />} />
        <Route path="/cows/:id/history" element={<CowHistoryPage />} />

        {/* Clinical Records */}
        <Route path="/cows/:id/clinical-records" element={<ClinicalRecordListPage />} />
        <Route path="/cows/:id/clinical-records/new" element={<ClinicalRecordFormPage />} />
        <Route path="/cows/:id/clinical-records/:recordId" element={<ClinicalRecordDetailPage />} />
        <Route
          path="/cows/:id/clinical-records/:recordId/edit"
          element={<ClinicalRecordFormPage />}
        />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Map & Profile */}
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Access (Admin only) */}
        <Route path="/access" element={<AccessLayout />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const AppRoutes = () => (
  <BrowserRouter>
    <AppRoutesInner />
  </BrowserRouter>
);
