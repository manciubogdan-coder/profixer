import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Craftsman } from "@/pages/Search";
import {
  Hammer,
  Wrench,
  Paintbrush,
  Plug,
  User,
} from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1Ijoid2VzdGVyMTIiLCJhIjoiY201aHpmbW8xMGs1ZDJrc2ZncXVpdnVidCJ9.l1qMsSzaQBOq8sopVis4BQ";

interface MapProps {
  craftsmen: Craftsman[];
}

const getCraftsmanIcon = (type: string | null) => {
  switch (type) {
    case "carpenter":
    case "mason":
    case "general_contractor":
      return Hammer;
    case "plumber":
    case "hvac_technician":
      return Wrench;
    case "painter":
      return Paintbrush;
    case "electrician":
      return Plug;
    default:
      return User;
  }
};

export const Map = ({ craftsmen }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [23.6236, 46.7712], // Cluj-Napoca coordinates
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    craftsmen.forEach((craftsman) => {
      if (!craftsman.latitude || !craftsman.longitude) return;

      // Create a custom marker element
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#9333EA";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "white";
      el.style.cursor = "pointer";

      // Create the icon element
      const IconComponent = getCraftsmanIcon(craftsman.craftsman_type);
      const icon = document.createElement("div");
      icon.innerHTML = IconComponent({
        size: 20,
        color: "white",
        absoluteStrokeWidth: true,
      }).outerHTML;
      el.appendChild(icon);

      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([craftsman.longitude, craftsman.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h3 class="font-medium">${craftsman.first_name} ${craftsman.last_name}</h3>
              <p class="text-sm text-gray-500">${craftsman.city}, ${craftsman.county}</p>
            </div>`
          )
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [craftsmen]);

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};