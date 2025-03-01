
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
  switch (tradeName?.toLowerCase()) {
    case "tâmplar":
      return Hammer;
    case "instalator":
      return Wrench;
    case "zugrav":
      return Paintbrush;
    case "electrician":
      return Plug;
    case "arhitect":
      return Ruler;
    case "lăcătuș":
      return Lock;
    case "constructor":
      return Construction;
    case "dulgher":
      return Home;
    case "climatizare":
      return Wind;
    case "zidar":
      return Blocks;
    case "hidroizolator":
      return Warehouse;
    case "peisagist":
      return Shovel;
    case "amenajări interioare":
      return Home;
    case "amenajări exterioare":
      return Truck;
    case "electricitate":
      return Lightbulb;
    case "frizerie":
      return Scissors;
    default:
      return HardHat;
  }
};

export const Map = ({ craftsmen, userLocation, onCraftsmanClick }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Define default center as tuple with two fixed numbers
    const defaultCenter: [number, number] = [26.1025, 44.4268]; // Bucharest

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation 
          ? [userLocation.lng, userLocation.lat] as [number, number]
          : defaultCenter,
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add user location marker whenever userLocation changes
  useEffect(() => {
    if (!map.current || !userLocation) return;

    try {
      // Update map center when user location changes
      map.current.setCenter([userLocation.lng, userLocation.lat]);
      
      // Create user marker
      const el = document.createElement("div");
      el.className = "user-marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#3B82F6";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.5)";

      // Remove existing user markers if any
      const userMarkerEl = document.querySelector('.user-marker');
      if (userMarkerEl) {
        userMarkerEl.remove();
      }

      new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      console.log("User location marker added at:", userLocation);
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [userLocation]);

  // Update craftsmen markers whenever craftsmen array changes
  useEffect(() => {
    if (!map.current) {
      console.log("Map not initialized");
      return;
    }

    console.log("Updating craftsmen markers, total craftsmen:", craftsmen.length);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Show all craftsmen - filter removed
    const visibleCraftsmen = craftsmen;

    console.log("Adding markers for craftsmen:", visibleCraftsmen.length);

    visibleCraftsmen.forEach((craftsman) => {
      if (!craftsman.latitude || !craftsman.longitude) {
        console.log("Missing coordinates for craftsman:", craftsman.id);
        return;
      }

      try {
        // Create marker element
        const el = document.createElement("div");
        el.className = "craftsman-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#9333EA";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = "white";
        el.style.cursor = "pointer";

        // Get correct icon for craftsman trade
        const IconComponent = getCraftsmanIcon(craftsman.trade?.name || null);
        
        // Render icon to string
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
        
        const craftsmanId = craftsman.id;
        const phone = craftsman.phone;
        
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
              <button class="bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-green-700" data-phone="${phone}">
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
            onCraftsmanClick(craftsman);
          } else if (button.hasAttribute('data-phone')) {
            const phone = button.getAttribute('data-phone');
            if (phone) {
              window.location.href = `tel:${phone}`;
            }
          }
        };

        popupContent.addEventListener('click', handlePopupClick);

        // Create and add popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup',
        }).setDOMContent(popupContent);

        // Create and add marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([craftsman.longitude, craftsman.latitude])
          .setPopup(popup)
          .addTo(map.current);

        markersRef.current.push(marker);
        console.log("Added marker for craftsman:", craftsman.id);
      } catch (error) {
        console.error("Error adding marker for craftsman:", craftsman.id, error);
      }
    });

  }, [craftsmen, onCraftsmanClick, userLocation]);

  return (
    <div className="flex-1 relative h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      <style>{`
        .mapboxgl-popup-content {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 0;
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
