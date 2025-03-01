
import { useEffect, useRef, useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { toast } from "sonner";

// Use your Mapbox token here
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
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current || mapInitializedRef.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Default center for Romania
      const defaultCenter: [number, number] = [25.0094, 45.9443];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation 
          ? [userLocation.lng, userLocation.lat] as [number, number]
          : defaultCenter,
        zoom: 7,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        // Check if map was initialized with the correct center
        if (map.current) {
          const center = map.current.getCenter();
          console.log("Map center:", center.lng, center.lat);
        }
      });
      
      mapInitializedRef.current = true;
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Eroare la inițializarea hărții. Reîncărcați pagina.");
      toast.error("Eroare la inițializarea hărții. Reîncărcați pagina.");
    }

    return () => {
      if (map.current) {
        console.log("Removing map instance");
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // Update user location
  useEffect(() => {
    if (!map.current || !userLocation || !mapInitializedRef.current) return;

    try {
      console.log("Updating user location on map:", userLocation.lat, userLocation.lng);
      
      // Remove existing user marker
      const existingUserMarker = document.querySelector('.user-marker-container');
      if (existingUserMarker) {
        existingUserMarker.remove();
      }
      
      // Create user marker
      const el = document.createElement("div");
      el.className = "user-marker-container";
      
      const userMarker = document.createElement("div");
      userMarker.className = "user-marker";
      userMarker.style.width = "20px";
      userMarker.style.height = "20px";
      userMarker.style.borderRadius = "50%";
      userMarker.style.backgroundColor = "#3B82F6";
      userMarker.style.border = "2px solid white";
      userMarker.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.5)";
      
      el.appendChild(userMarker);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      console.log("User location marker added/updated");
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [userLocation]);

  // Update craftsmen markers - this is the critical function for showing craftsmen on the map
  useEffect(() => {
    if (!map.current || !mapInitializedRef.current) {
      console.log("Map not initialized, cannot add craftsmen markers");
      return;
    }

    console.log("Updating craftsmen markers, total craftsmen:", craftsmen.length);
    
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter craftsmen with valid coordinates
    const craftsmenWithCoordinates = craftsmen.filter(c => 
      c.latitude !== null && c.latitude !== undefined && 
      c.longitude !== null && c.longitude !== undefined &&
      typeof c.latitude === 'number' && typeof c.longitude === 'number' &&
      !isNaN(c.latitude) && !isNaN(c.longitude) &&
      c.latitude >= -90 && c.latitude <= 90 &&
      c.longitude >= -180 && c.longitude <= 180
    );
    
    console.log(`Craftsmen with valid coordinates after filtering: ${craftsmenWithCoordinates.length} out of ${craftsmen.length}`);
    
    if (craftsmenWithCoordinates.length === 0) {
      console.warn("No craftsmen have valid coordinates to display on the map");
      return;
    }

    // Create bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add markers for craftsmen with coordinates
    craftsmenWithCoordinates.forEach((craftsman) => {
      try {
        if (!craftsman.latitude || !craftsman.longitude || 
            typeof craftsman.latitude !== 'number' || 
            typeof craftsman.longitude !== 'number') {
          return;
        }
        
        console.log(`Adding marker for ${craftsman.first_name} ${craftsman.last_name} at [${craftsman.longitude}, ${craftsman.latitude}]`);
        
        // Create marker element
        const el = document.createElement("div");
        el.className = "craftsman-marker";
        el.style.width = "34px";
        el.style.height = "34px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#9333EA";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = "white";
        el.style.cursor = "pointer";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 0 0 2px rgba(147, 51, 234, 0.5)";
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

        // Add click handlers for popup buttons
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

        // Create and attach popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup',
        }).setDOMContent(popupContent);

        // Create and add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([craftsman.longitude, craftsman.latitude])
          .setPopup(popup)
          .addTo(map.current);

        // Save marker reference
        markersRef.current.push(marker);
        
        // Extend map bounds to include this marker
        bounds.extend([craftsman.longitude, craftsman.latitude]);
        
        console.log(`Added marker for craftsman ${craftsman.id}`);
      } catch (error) {
        console.error(`Error adding marker for craftsman ${craftsman.id}:`, error);
      }
    });

    console.log(`Total markers added to map: ${markersRef.current.length}`);
    
    // Fit map to bounds if we have markers
    if (!bounds.isEmpty() && map.current) {
      // Also include user location in bounds if available
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      // Adjust map view with padding
      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15
      });
      
      console.log("Map view adjusted to fit all markers");
    } else {
      console.warn("No bounds to fit - either no markers or bounds calculation failed");
      
      // If we have user location but no craftsmen markers, center on user
      if (userLocation && map.current) {
        map.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 10
        });
      }
    }
  }, [craftsmen, onCraftsmanClick, userLocation]);

  return (
    <div className="flex-1 relative h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2 p-4 bg-card border rounded-md text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="font-semibold">Eroare hartă</h3>
            <p>{mapError}</p>
          </div>
        </div>
      )}
      
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
