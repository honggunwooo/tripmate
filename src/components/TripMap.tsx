"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

export type MapPlace = { name: string; lat: number; lng: number };

function numberIcon(n: number) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ places }: { places: MapPlace[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(
      places.map((p) => [p.lat, p.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [places, map]);
  return null;
}

export default function TripMap({ places }: { places: MapPlace[] }) {
  const line = places.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer
      center={[37.5665, 126.978]}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds places={places} />
      {places.map((p, i) => (
        <Marker
          key={`${p.name}-${i}`}
          position={[p.lat, p.lng]}
          icon={numberIcon(i + 1)}
        >
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
      {line.length > 1 && (
        <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 3 }} />
      )}
    </MapContainer>
  );
}
