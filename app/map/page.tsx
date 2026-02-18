"use client";

import { useEffect, useRef } from "react";
import Nav from "../components/Nav";

type Spot = {
  id: string;
  brand: string;
  type: string;
  model: string | null;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  created_at: string;
};

export default function MapPage() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: any;

    async function init() {
      if (!mapDivRef.current) return;

      const L = (await import("leaflet")).default;

      // Fix default marker icons in Next/Vercel
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(mapDivRef.current).setView([39.5, -98.35], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const res = await fetch("/api/spots", { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) return;

      const spots = data.spots as Spot[];

      // optional: auto-zoom to points if you have any
      const bounds: any[] = [];

      spots.forEach((spot) => {
        if (spot.latitude == null || spot.longitude == null) return;

        const latlng: [number, number] = [spot.latitude, spot.longitude];
        bounds.push(latlng);

        const title = `${spot.brand} · ${spot.type}${
          spot.model ? ` · ${spot.model}` : ""
        }`;

        const noteHtml = spot.note
          ? `<div style="margin-top:4px;color:#555;font-size:12px;">${escapeHtml(
              spot.note
            )}</div>`
          : "";

        const imgHtml = spot.photo_url
          ? `<img src="${spot.photo_url}" style="width:100%; margin-top:8px; border-radius:10px;" />`
          : "";

        const popupHtml = `
          <div style="max-width:220px">
            <div style="font-weight:600">${escapeHtml(title)}</div>
            ${noteHtml}
            ${imgHtml}
            <div style="margin-top:6px;color:#777;font-size:11px;">
              ${new Date(spot.created_at).toLocaleString()}
            </div>
          </div>
        `;

        // Photo marker using DivIcon (reliable)
        let icon: any;

        if (spot.photo_url) {
          const safeUrl = escapeAttr(spot.photo_url);
          icon = L.divIcon({
            className: "", // prevent Leaflet default styles
            iconSize: [56, 56],
            iconAnchor: [28, 28],
            popupAnchor: [0, -28],
            html: `
              <div style="
                width:56px;height:56px;border-radius:9999px;overflow:hidden;
                border:2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,.25);
                background:#fff;
              ">
                <img src="${safeUrl}" style="width:100%;height:100%;object-fit:cover;" />
              </div>
            `,
          });
        } else {
          icon = L.icon({
            iconUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          });
        }

        L.marker(latlng, { icon }).addTo(map).bindPopup(popupHtml);
      });

      if (bounds.length >= 2) {
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      }
    }

    init();

    return () => {
      if (map) map.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Nav />
      <div ref={mapDivRef} className="h-[80vh] w-full" />
    </div>
  );
}

// Escapes text for HTML content
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Escapes attribute values (e.g., URLs inside src="...")
function escapeAttr(input: string) {
  return input.replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
