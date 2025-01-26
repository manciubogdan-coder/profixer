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
  Ruler,
  Lock,
  Home,
  Wind,
  HardHat,
} from "lucide-react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const MAPBOX_TOKEN = "pk.eyJ1Ijoid2VzdGVyMTIiLCJhIjoiY201aHpmbW8xMGs1ZDJrc2ZncXVpdnVidCJ9.l1qMsSzaQBOq8sopVis4BQ";

interface MapProps {
  craftsmen: Craftsman[];
  userLocation: { lat: number; lng: number } | null;
  onCraftsmanClick: (craftsman: Craftsman) => void;
}

const getCraftsmanIcon = (type: string | null) => {
  switch (type) {
    case "carpenter":
      return Ruler;
    case "mason":
      return HardHat;
    case "general_contractor":
      return Home;
    case "plumber":
      return Wrench;
    case "hvac_technician":
      return Wind;
    case "painter":
      return Paintbrush;
    case "electrician":
      return Plug;
    case "locksmith":
      return Lock;
    case "welder":
    case "roofer":
      return Hammer;
    default:
      return User;
  }
};

export const Map = ({ craftsmen, userLocation, onCraftsmanClick }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation 
        ? [userLocation.lng, userLocation.lat]
        : [23.6236, 46.7712], // Cluj-Napoca coordinates as fallback
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add user location marker if available
    if (userLocation) {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#3B82F6";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.5)";

      new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [userLocation]);

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

      // Create the icon element using renderToString
      const IconComponent = getCraftsmanIcon(craftsman.craftsman_type);
      const iconHtml = renderToString(
        createElement(IconComponent, {
          size: 20,
          color: "white",
          absoluteStrokeWidth: true,
        })
      );
      el.innerHTML = iconHtml;

      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([craftsman.longitude, craftsman.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-4">
              <h3 class="text-lg font-semibold">${craftsman.first_name} ${craftsman.last_name}</h3>
              <p class="text-sm text-gray-600 mt-1">${craftsman.city}, ${craftsman.county}</p>
              <p class="text-sm text-gray-600">${craftsman.craftsman_type ? craftsman.craftsman_type.replace('_', ' ').charAt(0).toUpperCase() + craftsman.craftsman_type.slice(1) : 'General'}</p>
              <button
                class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
                onclick="window.dispatchEvent(new CustomEvent('craftsmanClick', { detail: '${craftsman.id}' }))"
              >
                Vezi profilul
              </button>
            </div>
          `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [craftsmen]);

  // Add event listener for craftsman click
  useEffect(() => {
    const handleCraftsmanClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      const craftsman = craftsmen.find(c => c.id === customEvent.detail);
      if (craftsman) {
        onCraftsmanClick(craftsman);
      }
    };

    window.addEventListener('craftsmanClick', handleCraftsmanClick);

    return () => {
      window.removeEventListener('craftsmanClick', handleCraftsmanClick);
    };
  }, [craftsmen, onCraftsmanClick]);

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};