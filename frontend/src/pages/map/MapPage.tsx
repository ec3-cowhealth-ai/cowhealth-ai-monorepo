import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useMemo, useEffect } from "react";
import { AppBar } from "@components/layout";
import { Icon } from "@components/ui/Icon";
import { useCows } from "@features/cows/hooks/useCows";
import { useFarmContext } from "../../context/FarmContext";
import { COW_STATUS_VALUES } from "../../types/cows";
import type { Cow } from "../../types/cows";
import { MapLegend } from "./MapLegend";
import { CowDetailCard } from "./CowDetailCard";
import { simulateCowPositions } from "./simulateCowPositions";

const STATUS_COLOR: Record<string, string> = {
  [COW_STATUS_VALUES.HEALTHY]: "#22c55e",
  [COW_STATUS_VALUES.HEAT_STRESS]: "#f59e0b",
  [COW_STATUS_VALUES.CALVING]: "#6bb4e8",
  [COW_STATUS_VALUES.ALERT]: "#ef4444",
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 1 });
  }, [map, lat, lng]);
  return null;
}

function makeCowIcon(color: string, selected: boolean, isReal: boolean) {
  const cls = [
    "cow-map-pin",
    selected ? "cow-map-pin--selected" : "",
    !isReal ? "cow-map-pin--simulated" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: "",
    html: `<div class="${cls}">
      <div class="cow-map-pin__dot" style="background:${color}"></div>
      <div class="cow-map-pin__ring" style="background:${color}"></div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export const MapPage = () => {
  const { selectedFarm, farms, setSelectedFarm } = useFarmContext();
  const [selectedCow, setSelectedCow] = useState<{ cow: Cow; lat: number; lng: number } | null>(
    null,
  );

  const farmId = selectedFarm ? String(selectedFarm.id) : undefined;
  const { data: rawCows = [] } = useCows({ farmId });
  const cows = rawCows.filter((c: Cow) => c.status !== COW_STATUS_VALUES.RETIRED);

  const alertCows = cows.filter((c: Cow) => c.status === COW_STATUS_VALUES.ALERT);
  const heatStressCows = cows.filter((c: Cow) => c.status === COW_STATUS_VALUES.HEAT_STRESS);
  const calvingCows = cows.filter((c: Cow) => c.status === COW_STATUS_VALUES.CALVING);
  const okCount = cows.filter((c: Cow) => c.status === COW_STATUS_VALUES.HEALTHY).length;

  const cowsWithPosition = useMemo(() => {
    const cowsWithoutGps = cows.filter((c: Cow) => c.lastLat == null || c.lastLng == null);

    const simulated = selectedFarm
      ? simulateCowPositions(
          cowsWithoutGps.map((c: Cow) => ({ id: c.id })),
          selectedFarm.id,
          (selectedFarm as { latitude?: number }).latitude ?? undefined,
          (selectedFarm as { longitude?: number }).longitude ?? undefined,
        )
      : [];

    const simMap = new Map(simulated.map((p) => [p.cowId, p]));

    return cows.map((c: Cow) => ({
      cow: c,
      lat: c.lastLat ?? simMap.get(c.id)?.lat,
      lng: c.lastLng ?? simMap.get(c.id)?.lng,
      isReal: c.lastLat != null,
    }));
  }, [cows, selectedFarm]);

  const validPins = cowsWithPosition.filter((p) => p.lat != null && p.lng != null);
  const realGpsCount = cowsWithPosition.filter((p) => p.isReal).length;

  const center = useMemo((): [number, number] => {
    if (validPins.length > 0) {
      const avgLat = validPins.reduce((s, p) => s + p.lat!, 0) / validPins.length;
      const avgLng = validPins.reduce((s, p) => s + p.lng!, 0) / validPins.length;
      return [avgLat, avgLng];
    }
    return [-15.7801, -47.9292];
  }, [validPins]);

  const handleNextFarm = () => {
    const idx = farms.findIndex((f) => f.id === selectedFarm?.id);
    const next = farms[(idx + 1) % farms.length];
    if (next) setSelectedFarm(next);
  };

  return (
    <div className="app-page" style={{ padding: 0, position: "relative", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        zoomControl={false}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validPins.map(({ cow, lat, lng, isReal }) => (
          <Marker
            key={cow.id}
            position={[lat!, lng!]}
            icon={makeCowIcon(
              STATUS_COLOR[cow.status] ?? "#22c55e",
              selectedCow?.cow.id === cow.id,
              isReal,
            )}
            eventHandlers={{
              click: () =>
                setSelectedCow(
                  selectedCow?.cow.id === cow.id ? null : { cow, lat: lat!, lng: lng! },
                ),
            }}
          >
            <Popup>
              <strong>{cow.name ?? cow.tag}</strong>
              <br />#{cow.tag} · {cow.status}
              <br />
              {isReal ? "📡 GPS real" : "〰 Simulado"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <AppBar
          title={selectedFarm?.name ?? "Mapa"}
          subtitle="Mapa da Fazenda"
          showBack={false}
          left={undefined}
          actions={undefined}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "8px 16px",
          display: "flex",
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            background: "var(--bg-elev-2)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 10,
          }}
        >
          <Icon n="search" s={16} c="var(--text-muted)" />
          <span style={{ flex: 1, fontSize: 14, color: "var(--text-muted)" }}>
            {validPins.length} vacas · {realGpsCount} GPS real · {validPins.length - realGpsCount}{" "}
            simuladas
          </span>
        </div>

        <button
          style={{
            height: 44,
            borderRadius: 12,
            paddingInline: 12,
            background: "var(--bg-elev-2)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={handleNextFarm}
        >
          <Icon n="chevronRight" s={14} />
          Próxima
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 1000 }}>
        <MapLegend
          okCount={okCount}
          heatStressCount={heatStressCows.length}
          calvingCount={calvingCows.length}
          alertCount={alertCows.length}
        />
      </div>

      {selectedCow && (
        <div style={{ position: "absolute", bottom: 80, left: 16, right: 16, zIndex: 1000 }}>
          <CowDetailCard cow={selectedCow.cow} lat={selectedCow.lat} lng={selectedCow.lng} />
        </div>
      )}
    </div>
  );
};
