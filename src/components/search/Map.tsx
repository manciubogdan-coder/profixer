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
  Star,
  PhoneCall,
  Shovel,
  Scissors,
  Construction,
  Warehouse,
  Truck,
  Lightbulb,
  Blocks,
} from "lucide-react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const MAPBOX_TOKEN = "pk.eyJ1Ijoid2VzdGVyMTIiLCJhIjoiY201aHpmbW8xMGs1ZDJrc2ZncXVpdnVidCJ9.l1qMsSzaQBOq8sopVis4BQ";

interface MapProps {
  craftsmen: Craftsman[];
  userLocation: { lat: number; lng: number } | null;
  onCraftsmanClick: (craftsman: Craftsman) => void;
}

const getCraftsmanIcon = (tradeName: string | null) => {
  console.log("Trade name:", tradeName);
  switch (tradeName?.toLowerCase()) {
    case "tâmplar":
      return Ruler;
    case "zidar":
      return Blocks;
    case "constructor":
      return Construction;
    case "instalator":
      return Wrench;
    case "tehnician hvac":
      return Wind;
    case "zugrav":
      return Paintbrush;
    case "electrician":
      return Plug;
    case "lăcătuș":
      return Lock;
    case "sudor":
      return Construction;
    case "acoperișar":
      return Home;
    case "amenajări interioare":
      return Warehouse;
    case "amenajări exterioare":
      return Shovel;
    case "gresie și faianță":
      return Blocks;
    case "parchetar":
      return Scissors;
    case "rigipsar":
      return Construction;
    case "termotehnist":
      return Lightbulb;
    case "transport":
      return Truck;
    case "demolări":
      return HardHat;
    default:
      console.log("Using default icon for trade:", tradeName);
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
      const IconComponent = getCraftsmanIcon(craftsman.trade?.name || null);
      const iconHtml = renderToString(
        createElement(IconComponent, {
          size: 20,
          color: "white",
          absoluteStrokeWidth: true,
        })
      );
      el.innerHTML = iconHtml;

      // Create popup content
      const popupContent = document.createElement("div");
      popupContent.className = "p-4 bg-background text-foreground";

      // Store only the necessary data as data attributes
      const craftsmanId = craftsman.id;
      
      popupContent.innerHTML = `
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold text-foreground">${craftsman.first_name} ${craftsman.last_name}</h3>
            <p class="text-sm text-muted-foreground">${craftsman.trade?.name || "Meserie nesetată"}</p>
            <p class="text-sm text-muted-foreground">${craftsman.city}, ${craftsman.county}</p>
          </div>
          <div class="flex items-center gap-1">
            <span class="flex items-center">
              ${renderToString(createElement(Star, { size: 16, className: "text-yellow-400 fill-yellow-400" }))}
            </span>
            <span class="text-sm text-foreground">${craftsman.average_rating?.toFixed(1) || "N/A"}</span>
          </div>
          <div class="flex gap-2">
            <button class="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-primary/90" data-craftsman-id="${craftsmanId}">
              ${renderToString(createElement(User, { size: 16 }))}
              Vezi profil
            </button>
            <button class="bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-green-700" data-phone="${craftsman.phone}">
              ${renderToString(createElement(PhoneCall, { size: 16 }))}
              Sună acum
            </button>
          </div>
        </div>
      `;

      // Add click handlers
      const handlePopupClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button');
        if (!button) return;

        if (button.hasAttribute('data-craftsman-id')) {
          const id = button.getAttribute('data-craftsman-id');
          const selectedCraftsman = craftsmen.find(c => c.id === id);
          if (selectedCraftsman) {
            onCraftsmanClick(selectedCraftsman);
          }
        } else if (button.hasAttribute('data-phone')) {
          const phone = button.getAttribute('data-phone');
          if (phone) {
            window.location.href = `tel:${phone}`;
          }
        }
      };

      popupContent.addEventListener('click', handlePopupClick);

      // Create and add the popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'custom-popup',
      }).setDOMContent(popupContent);

      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([craftsman.longitude, craftsman.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
    });

  }, [craftsmen, onCraftsmanClick]);

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <style>{`
        .mapboxgl-popup-content {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
        }
        .mapboxgl-popup-close-button {
          color: hsl(var(--foreground));
          font-size: 16px;
          padding: 4px 8px;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: hsl(var(--muted));
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};