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
import "../styles/dashboard.css";

type DateRangeOption = "7days" | "14days" | "30days" | "90days";

export const DashboardPage = () => {
  const { selectedFarm, farms } = useFarmContext();

  // Cow selection state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("global");
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(
    selectedFarm ? String(selectedFarm.id) : null,
  );
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);

  // Date range state
  const [dateRange, setDateRange] = useState<DateRangeOption>("7days");
  const [showDateMenu, setShowDateMenu] = useState(false);

  const getDateRange = (option: DateRangeOption) => {
    const now = new Date();
    const days = option === "7days" ? 7 : option === "14days" ? 14 : option === "30days" ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate: startDate.toISOString().split("T")[0], endDate: now.toISOString().split("T")[0] };
  };

  const dateRangeLabel = {
    "7days": "Últimos 7 dias",
    "14days": "Últimos 14 dias",
    "30days": "Últimos 30 dias",
    "90days": "Últimos 90 dias",
  };

  // KPI data — scoped to selected farm when in "farm" mode

  const kpiFarmId = selectionMode === "farm" && selectedFarmId ? selectedFarmId : undefined;
  const { startDate, endDate } = getDateRange(dateRange);
  const { data: overview }      = useDashboardOverview(kpiFarmId, startDate, endDate);
  const { data: cowsPerStatus } = useCowsPerStatus(kpiFarmId, startDate, endDate);

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
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <button
              onClick={() => setShowDateMenu(!showDateMenu)}
              style={{ ...btnOutlineStyle, position: "relative" }}
            >
              <CalIcon style={{ width: 16, height: 16, color: C.green }} />
              {dateRangeLabel[dateRange]}
              <ChevronDown style={{ width: 14, height: 14, color: C.muted }} />
            </button>
            {showDateMenu && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 8,
                background: "var(--bg-elev-1)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                zIndex: 1000,
                minWidth: 200,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}>
                {(["7days", "14days", "30days", "90days"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setDateRange(option);
                      setShowDateMenu(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 13,
                      background: dateRange === option ? "var(--bg-elev-2)" : "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      borderBottom: option !== "90days" ? `1px solid var(--border-subtle)` : undefined,
                    }}
                  >
                    {dateRangeLabel[option]}
                  </button>
                ))}
              </div>
            )}
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

        {/* Main 3-column layout — responsive with flexbox */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="dashboard-main-grid">
          <div style={{ display: "flex", flexDirection: "row", gap: 24 }} className="dashboard-top-row">
            <CowProfilePanel
              cowId={effectiveCowId}
              onPrev={handlePrev}
              onNext={handleNext}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
            <DashboardCenterPanel cowId={effectiveCowId} />
          </div>
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
