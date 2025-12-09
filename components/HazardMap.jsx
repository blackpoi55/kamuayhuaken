"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// รับคลิกบนแผนที่เฉพาะตอนเปิดโหมดวางจุด
function ClickToAddLauncher({ placementMode, onAddLauncher }) {
  useMapEvents({
    click(e) {
      if (!placementMode) return; // เลื่อนแมพได้ปกติถ้าไม่ได้เปิดโหมด
      if (typeof onAddLauncher === "function") {
        onAddLauncher(e.latlng);
      }
    },
  });
  return null;
}

// คุมการเลื่อนโฟกัสจาก props
function MapViewController({ mapFocus }) {
  const map = useMap();
  useEffect(() => {
    if (mapFocus && mapFocus.lat && mapFocus.lng) {
      map.setView([mapFocus.lat, mapFocus.lng], mapFocus.zoom ?? 7, {
        animate: true,
      });
    }
  }, [map, mapFocus]);
  return null;
}

export default function HazardMap({
  weapon,
  launchers,
  selectedLauncherId,
  setSelectedLauncherId,
  onAddLauncher,
  userLocation,
  mapFocus,
  placementMode,
}) {
  const zones = weapon?.zones ?? [];

  const defaultCenter = useMemo(() => {
    if (launchers && launchers.length > 0) {
      return [launchers[0].lat, launchers[0].lng];
    }
    // กลาง ๆ ไทย–กัมพูชา
    return [15.0, 104.5];
  }, [launchers]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom
        className="w-full h-full rounded-2xl overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.45)] border border-slate-800"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToAddLauncher
          placementMode={placementMode}
          onAddLauncher={onAddLauncher}
        />
        <MapViewController mapFocus={mapFocus} />

        {/* วงรัศมีรอบทุกจุดยิง */}
        {launchers?.map((l) =>
          zones.map((z) => (
            <Circle
              key={`${l.id}-${z.id}`}
              center={[l.lat, l.lng]}
              radius={z.outerRadiusKm * 1000}
              pathOptions={{
                color: z.color,
                fillColor: z.color,
                fillOpacity: 0.12,
                weight: 1,
              }}
            />
          )),
        )}

        {/* จุดยิง (CircleMarker) */}
        {launchers?.map((l) => (
          <CircleMarker
            key={l.id}
            center={[l.lat, l.lng]}
            radius={7}
            pathOptions={{
              color:
                selectedLauncherId === l.id ? "#22d3ee" : "#f97316",
              fillColor:
                selectedLauncherId === l.id ? "#22d3ee" : "#f97316",
              fillOpacity: 0.95,
              weight: 2,
            }}
            eventHandlers={{
              click: () => setSelectedLauncherId(l.id),
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-semibold mb-1">
                  จุดตั้งระบบ: {l.name}
                </div>
                <div>
                  lat {l.lat.toFixed(4)}, lng {l.lng.toFixed(4)}
                </div>
                {zones.length > 0 && (
                  <>
                    <div className="mt-1 font-semibold">โซนรัศมีในโหมดนี้</div>
                    <ul className="list-disc list-inside">
                      {zones.map((z) => (
                        <li key={z.id}>{z.label}</li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="mt-1 text-[10px] text-slate-500">
                  * วงกลมเป็นการประมาณหยาบ ๆ เพื่อช่วยวางแผนอพยพเท่านั้น
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ตำแหน่งของฉัน */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={6}
            pathOptions={{
              color: "#22c55e",
              fillColor: "#22c55e",
              fillOpacity: 0.95,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs font-semibold">
                ตำแหน่งของฉัน (โดยประมาณ)
              </div>
              <div className="text-xs">
                lat {userLocation.lat.toFixed(4)}, lng{" "}
                {userLocation.lng.toFixed(4)}
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                มีความคลาดเคลื่อนจาก GPS/เครือข่าย
                ใช้เพื่อดูภาพรวมเท่านั้น
              </p>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {/* แถบแจ้งเตือนโหมดเพิ่มจุด */}
      {placementMode && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-50 text-xs md:text-sm px-4 py-2 rounded-full shadow-lg border border-cyan-400/60">
          โหมดเพิ่มจุดเปิดอยู่ – คลิกบนแผนที่เพื่อสร้างจุดตั้งระบบใหม่
        </div>
      )}
    </div>
  );
}
