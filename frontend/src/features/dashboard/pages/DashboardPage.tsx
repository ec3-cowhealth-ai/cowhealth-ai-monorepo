import { useState, useCallback } from "react";
import { AppBar } from "@components/layout";
import { useFarmContext } from "@/context/FarmContext";
import { useDashboardOverview, useCowsPerStatus } from "../hooks/useDashboard";
import { useCows } from "@features/cows/hooks/useCows";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { C } from "../constants/colors";
import { DashboardKPIs } from "../components/DashboardKPIs";
import { CowSelectorBar, type SelectionMode } from "../components/CowSelectorBar";
import { CowProfilePanel } from "../components/CowProfilePanel";
import { DashboardCenterPanel } from "../components/DashboardCenterPanel";
import { DashboardAlertFeed } from "../components/DashboardAlertFeed";
import { DashboardActivityTimeline } from "../components/DashboardActivityTimeline";

export const DashboardPage = () => {
  const { selectedFarm, farms } = useFarmContext();

  // Cow selection state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("global");
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(
    selectedFarm ? String(selectedFarm.id) : null,
  );
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);

  // KPI data — scoped to selected farm when in "farm" mode
  const kpiFarmId = selectionMode === "farm" && selectedFarmId ? selectedFarmId : undefined;
  const { data: overview }      = useDashboardOverview(kpiFarmId);
  const { data: cowsPerStatus } = useCowsPerStatus(kpiFarmId);

  // Cow list for selector
  const cowListFilters =
    selectionMode === "farm" && selectedFarmId
      ? { farmId: selectedFarmId }
      : selectionMode === "global"
        ? undefined
        : undefined;

  const { data: cowList = [], isLoading: loadingCows } = useCows(
    selectionMode !== "alert" ? cowListFilters : undefined,
  );

  // Alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useUnreadNotifications();

  const handleCowSelect = useCallback((id: string) => setSelectedCowId(id), []);

  const handleAlertCowSelect = useCallback((cowId: string) => {
    setSelectedCowId(cowId);
  }, []);

  return (
    <div className="app-page" style={{ background: C.bg, minHeight: "100%" }}>
      <AppBar title="Visão geral do rebanho" />

      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Farm subtitle */}
        {selectedFarm && (
          <div style={{ fontSize: 13, color: C.muted }}>
            {selectedFarm.name}
            {overview?.totalCows !== undefined && ` · ${overview.totalCows} cabeças`}
          </div>
        )}

        {/* Cow selector */}
        <CowSelectorBar
          mode={selectionMode}
          onModeChange={setSelectionMode}
          selectedCowId={selectedCowId}
          onCowSelect={handleCowSelect}
          cowList={cowList}
          farms={farms}
          selectedFarmId={selectedFarmId}
          onFarmChange={setSelectedFarmId}
          alerts={alerts}
          isLoadingCows={loadingCows}
        />

        {/* KPIs */}
        <DashboardKPIs overview={overview} cowsPerStatus={cowsPerStatus} />

        {/* Main 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
          <CowProfilePanel cowId={selectedCowId} />
          <DashboardCenterPanel cowId={selectedCowId} />
          <DashboardAlertFeed
            alerts={alerts}
            isLoading={loadingAlerts}
            onSelectCow={handleAlertCowSelect}
          />
        </div>

        {/* Activity timeline */}
        <DashboardActivityTimeline cowId={selectedCowId} />

      </div>
    </div>
  );
};
