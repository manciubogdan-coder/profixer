
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
  const mapInitializedRef = useRef(false);

  // Inițializarea hărții
  useEffect(() => {
    if (!mapContainer.current || mapInitializedRef.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const defaultCenter: [number, number] = [26.1025, 44.4268]; // Bucharest

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation 
          ? [userLocation.lng, userLocation.lat] as [number, number]
          : defaultCenter,
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      
      mapInitializedRef.current = true;
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // Actualizare locație utilizator
  useEffect(() => {
    if (!map.current || !userLocation || !mapInitializedRef.current) return;

    try {
      // Actualizează centrul hărții la locația utilizatorului dacă aceasta s-a schimbat
      map.current.setCenter([userLocation.lng, userLocation.lat]);
      
      // Caută markerul existent pentru utilizator și elimină-l
      const existingUserMarker = document.querySelector('.user-marker-container');
      if (existingUserMarker) {
        existingUserMarker.remove();
      }
      
      // Creează un nou container pentru markerul utilizatorului
      const el = document.createElement("div");
      el.className = "user-marker-container";
      
      // Creează un element pentru markerul utilizatorului cu un stil distinct
      const userMarker = document.createElement("div");
      userMarker.className = "user-marker";
      userMarker.style.width = "20px";
      userMarker.style.height = "20px";
      userMarker.style.borderRadius = "50%";
      userMarker.style.backgroundColor = "#3B82F6";
      userMarker.style.border = "2px solid white";
      userMarker.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.5)";
      
      el.appendChild(userMarker);

      // Adaugă markerul pe hartă
      new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      console.log("User location marker added/updated at:", userLocation);
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [userLocation]);

  // Actualizare markeri pentru meșteri
  useEffect(() => {
    if (!map.current || !mapInitializedRef.current) {
      console.log("Map not initialized, cannot add craftsmen markers");
      return;
    }

    console.log("Updating craftsmen markers, total craftsmen:", craftsmen.length);
    
    // Log all craftsmen with coordinates for debugging
    const craftsmenWithCoords = craftsmen.filter(
      c => typeof c.latitude === 'number' && typeof c.longitude === 'number'
    );
    console.log(`Craftsmen with valid coordinates: ${craftsmenWithCoords.length} out of ${craftsmen.length}`);
    
    craftsmenWithCoords.forEach((c, i) => {
      console.log(`Craftsman ${i}: ID=${c.id}, Name=${c.first_name} ${c.last_name}, Lat=${c.latitude}, Lng=${c.longitude}`);
    });

    // Șterge markerii existenți
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Adaugă noi markeri pentru meșteri
    craftsmen.forEach((craftsman) => {
      // Verificare strictă a coordonatelor
      if (typeof craftsman.latitude !== 'number' || typeof craftsman.longitude !== 'number' || 
          isNaN(craftsman.latitude) || isNaN(craftsman.longitude)) {
        console.log(`Missing or invalid coordinates for craftsman ${craftsman.id}: lat=${craftsman.latitude}, lng=${craftsman.longitude}`);
        return;
      }

      try {
        // Creează elementul marker cu iconiță specifică meseriei
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
        el.dataset.craftsman = craftsman.id;

        const IconComponent = getCraftsmanIcon(craftsman.trade?.name || null);
        
        const iconHtml = renderToString(
          createElement(IconComponent, {
            size: 20,
            color: "white",
            absoluteStrokeWidth: true,
          })
        );
        el.innerHTML = iconHtml;

        // Creare conținut popup cu informații despre meșter
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

        // Adăugare eveniment click pentru butoanele din popup
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

        // Creare popup și atașare la marker
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup',
        }).setDOMContent(popupContent);

        // Creare marker și adăugare pe hartă
        const marker = new mapboxgl.Marker(el)
          .setLngLat([craftsman.longitude, craftsman.latitude])
          .setPopup(popup)
          .addTo(map.current);

        // Memorare referință pentru curățare ulterioară
        markersRef.current.push(marker);
        
        console.log(`Added marker for craftsman: ${craftsman.id} at coordinates: [${craftsman.longitude}, ${craftsman.latitude}]`);
      } catch (error) {
        console.error("Error adding marker for craftsman:", craftsman.id, error);
      }
    });

    console.log(`Total markers added to map: ${markersRef.current.length}`);
    
    // Ajustare zoom și bounds pentru a afișa toți meșterii dacă există
    if (markersRef.current.length > 0 && map.current) {
      try {
        const bounds = new mapboxgl.LngLatBounds();
        
        // Adăugare coordonate meșteri în bounds
        craftsmen.forEach((craftsman) => {
          if (typeof craftsman.longitude === 'number' && typeof craftsman.latitude === 'number') {
            bounds.extend([craftsman.longitude, craftsman.latitude]);
          }
        });
        
        // Adăugare locație utilizator în bounds dacă există
        if (userLocation) {
          bounds.extend([userLocation.lng, userLocation.lat]);
        }
        
        // Ajustare bounds cu padding
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      } catch (error) {
        console.error("Error adjusting map bounds:", error);
      }
    }
  }, [craftsmen, onCraftsmanClick]);

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
