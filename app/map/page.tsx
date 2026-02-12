"use client";

import { useEffect, useRef } from "react";
import Nav from "../components/Nav";

type Spot = {
  id: string;
  brand: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
};

export default function MapPage() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: any;

    async function init() {
      if (!mapDivRef.current) return;

      const L = (await import("leaflet")).default;

      map = L.map(mapDivRef.current).setView([39.5, -98.35], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const res = await fetch("/api/spots", { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) return;

      (data.spots as Spot[]).forEach((spot) => {
        if (spot.latitude == null || spot.longitude == null) return;

        L.marker([spot.latitude, spot.longitude])
          .addTo(map)
          .bindPopup(`${spot.brand} · ${spot.type}`);
      });
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
