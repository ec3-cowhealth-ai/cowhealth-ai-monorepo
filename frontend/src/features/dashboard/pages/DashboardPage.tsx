import { useState, useCallback } from "react";
import { useFarmContext } from "@/context/FarmContext";
import { useDashboardOverview, useCowsPerStatus } from "../hooks/useDashboard";
import { useCows } from "@features/cows/hooks/useCows";
import { useUnreadNotifications } from "@hooks/useNotifications";
import { C, btnOutlineStyle } from "../constants/colors";
import { DashboardKPIs } from "../components/DashboardKPIs";
import { CowSelectorBar, type SelectionMode } from "../components/CowSelectorBar";
import { CowProfilePanel } from "../components/CowProfilePanel";
import { DashboardCenterPanel } from "../components/DashboardCenterPanel";
import { DashboardAlertFeed } from "../components/DashboardAlertFeed";
import { DashboardActivityTimeline } from "../components/DashboardActivityTimeline";
import { DashboardOverviewChart } from "../components/DashboardOverviewChart";
import { CalIcon, FilterIcon, ChevronDown } from "../components/DashboardIcons";
import { CowHead } from "@components/ui/CowHeadIcon";

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

  // Get the display farm based on selection mode
  const displayFarm = selectionMode === "farm" && selectedFarmId
    ? farms.find((f) => String(f.id) === selectedFarmId)
    : null;

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

  const effectiveCowId = selectedCowId ?? (cowList[0] ? String(cowList[0].id) : null);

  const currentIndex = cowList.findIndex((c) => String(c.id) === effectiveCowId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < cowList.length - 1;

  const handleCowSelect = useCallback((id: string) => setSelectedCowId(id), []);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setSelectedCowId(String(cowList[currentIndex - 1].id));
  }, [currentIndex, cowList]);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < cowList.length - 1)
      setSelectedCowId(String(cowList[currentIndex + 1].id));
  }, [currentIndex, cowList]);

  const handleAlertCowSelect = useCallback((cowId: string) => {
    setSelectedCowId(cowId);
  }, []);

  return (
    <div className="app-page" style={{ background: C.bg, minHeight: "100%" }}>
      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* TopBar — fiel ao preview */}
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 42, lineHeight: 1, margin: 0, color: C.text, fontWeight: 400,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <CowHead size={38} color={C.green} />
              Visão geral do rebanho
            </h1>
            <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>
              {displayFarm?.name ?? "Todas as fazendas"}
              {overview?.totalCows !== undefined && ` · ${overview.totalCows} cabeças`}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ ...btnOutlineStyle }}>
              <CalIcon style={{ width: 16, height: 16, color: C.green }} />
              Últimos 7 dias
              <ChevronDown style={{ width: 14, height: 14, color: C.muted }} />
            </button>
            <button style={{ ...btnOutlineStyle }}>
              <FilterIcon style={{ width: 16, height: 16, color: C.green }} />
              Filtrar
            </button>
          </div>
        </header>

        {/* Cow selector */}
        <CowSelectorBar
          mode={selectionMode}
          onModeChange={setSelectionMode}
          selectedCowId={effectiveCowId}
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

        {/* Health timeline chart */}
        <DashboardOverviewChart farmId={selectedFarm?.id} />

        {/* Main 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
          <CowProfilePanel
            cowId={effectiveCowId}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
          <DashboardCenterPanel cowId={effectiveCowId} />
          <DashboardAlertFeed
            alerts={alerts}
            isLoading={loadingAlerts}
            onSelectCow={handleAlertCowSelect}
          />
        </div>

        {/* Activity timeline */}
        <DashboardActivityTimeline cowId={effectiveCowId} />

      </div>
    </div>
  );
};
