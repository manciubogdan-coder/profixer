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
import { supabase } from "@/integrations/supabase/client";

const MAPBOX_TOKEN = "pk.eyJ1Ijoid2VzdGVyMTIiLCJhIjoiY201aHpmbW8xMGs1ZDJrc2ZncXVpdnVidCJ9.l1qMsSzaQBOq8sopVis4BQ";

interface MapProps {
  craftsmen: Craftsman[];
  userLocation: { lat: number; lng: number } | null;
  onCraftsmanClick: (craftsman: Craftsman) => void;
}

const getCraftsmanIcon = (tradeName: string | null) => {
  if (!tradeName) return HardHat;
  
  const lowercaseTrade = tradeName.toLowerCase();
  
  if (lowercaseTrade.includes("tâmplar")) return Hammer;
  if (lowercaseTrade.includes("instalator")) return Wrench;
  if (lowercaseTrade.includes("zugrav")) return Paintbrush;
  if (lowercaseTrade.includes("electrician")) return Plug;
  if (lowercaseTrade.includes("arhitect")) return Ruler;
  if (lowercaseTrade.includes("lăcătuș")) return Lock;
  if (lowercaseTrade.includes("constructor")) return Construction;
  if (lowercaseTrade.includes("dulgher")) return Home;
  if (lowercaseTrade.includes("climatizare")) return Wind;
  if (lowercaseTrade.includes("zidar")) return Blocks;
  if (lowercaseTrade.includes("hidroizolator")) return Warehouse;
  if (lowercaseTrade.includes("peisagist")) return Shovel;
  if (lowercaseTrade.includes("amenajări interioare")) return Home;
  if (lowercaseTrade.includes("amenajări exterioare")) return Truck;
  if (lowercaseTrade.includes("electricitate")) return Lightbulb;
  if (lowercaseTrade.includes("frizerie")) return Scissors;
  
  return HardHat;
};

const getCurrentUserId = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id;
  } catch (error) {
    console.error('Eroare la obținerea utilizatorului curent:', error);
    return undefined;
  }
};

const recordProfileInteraction = async (craftsmanId: string, visitorId: string | undefined, interactionType: string) => {
  if (!visitorId) {
    console.log("Nu se poate înregistra interacțiunea deoarece ID-ul vizitatorului lipsește");
    return;
  }
  
  try {
    await supabase.from('profile_interactions').insert({
      craftsman_id: craftsmanId,
      visitor_id: visitorId,
      interaction_type: interactionType
    });
    console.log(`S-a înregistrat interacțiunea ${interactionType} pentru meșterul ${craftsmanId}`);
  } catch (error) {
    console.error('Eroare la înregistrarea interacțiunii cu profilul:', error);
  }
};

export const Map = ({ craftsmen, userLocation, onCraftsmanClick }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapInitializedRef = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Date despre meșteri primite în componenta Map:", craftsmen.length);
    craftsmen.forEach((c, idx) => {
      console.log(`[${idx}] Meșter: ${c.id}, ${c.first_name} ${c.last_name}, lat: ${c.latitude}, lng: ${c.longitude}, meserie: ${c.trade?.name}, rol: ${c.role}, email: ${c.email || 'N/A'}`);
    });
  }, [craftsmen]);

  useEffect(() => {
    if (!mapContainer.current || mapInitializedRef.current) return;

    try {
      console.log("Inițializare hartă...");
      mapboxgl.accessToken = MAPBOX_TOKEN;

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
        console.log("Harta s-a încărcat cu succes");
        if (map.current) {
          const center = map.current.getCenter();
          console.log("Centrul hărții:", center.lng, center.lat);
        }
      });
      
      mapInitializedRef.current = true;
      console.log("Harta a fost inițializată cu succes");
    } catch (error) {
      console.error("Eroare la inițializarea hărții:", error);
      setMapError("Eroare la inițializarea hărții. Reîncărcați pagina.");
      toast.error("Eroare la inițializarea hărții. Reîncărcați pagina.");
    }

    return () => {
      if (map.current) {
        console.log("Se elimină instanța hărții");
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !userLocation || !mapInitializedRef.current) return;

    try {
      console.log("Actualizare locație utilizator pe hartă:", userLocation.lat, userLocation.lng);
      
      const existingUserMarker = document.querySelector('.user-marker-container');
      if (existingUserMarker) {
        existingUserMarker.remove();
      }
      
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

      new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
      
      if (markersRef.current.length === 0) {
        map.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 8,
          essential: true
        });
      }
      
      console.log("Marker-ul locației utilizatorului a fost adăugat/actualizat");
    } catch (error) {
      console.error("Eroare la adăugarea marker-ului pentru locația utilizatorului:", error);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!map.current || !mapInitializedRef.current) {
      console.log("Harta nu este inițializată, nu se pot adăuga markerii meșterilor");
      return;
    }

    console.log("Actualizare markeri meșteri, total meșteri:", craftsmen.length);
    
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const craftsmenWithCoordinates = craftsmen.filter(c => 
      c.latitude !== null && c.latitude !== undefined && 
      c.longitude !== null && c.longitude !== undefined &&
      typeof c.latitude === 'number' && typeof c.longitude === 'number' &&
      !isNaN(c.latitude) && !isNaN(c.longitude) &&
      c.latitude >= -90 && c.latitude <= 90 &&
      c.longitude >= -180 && c.longitude <= 180
    );
    
    console.log(`Meșteri cu coordonate valide după filtrare: ${craftsmenWithCoordinates.length} din ${craftsmen.length}`);
    
    if (craftsmenWithCoordinates.length === 0) {
      console.warn("Nu există meșteri cu coordonate valide pentru a fi afișați pe hartă");
      
      if (userLocation && map.current) {
        map.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 8
        });
      }
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    
    craftsmenWithCoordinates.forEach((craftsman) => {
      try {
        if (!craftsman.latitude || !craftsman.longitude || 
            typeof craftsman.latitude !== 'number' || 
            typeof craftsman.longitude !== 'number') {
          console.warn(`Se omite meșterul ${craftsman.id} (${craftsman.email || 'email necunoscut'}) din cauza coordonatelor invalide:`, 
            craftsman.latitude, craftsman.longitude);
          return;
        }
        
        console.log(`Se adaugă marker pentru ${craftsman.first_name} ${craftsman.last_name} (${craftsman.email || 'email necunoscut'}) la [${craftsman.longitude}, ${craftsman.latitude}], meserie: ${craftsman.trade?.name}`);
        
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

        if (craftsman.email === "manciubogdan999@gmail.com") {
          el.style.backgroundColor = "#EF4444";
          el.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.5)";
          el.style.width = "40px";
          el.style.height = "40px";
          console.log("IMPORTANT: Am adăugat marker special pentru meșterul căutat manciubogdan999@gmail.com");
        }

        const IconComponent = getCraftsmanIcon(craftsman.trade?.name || null);
        
        const iconHtml = renderToString(
          createElement(IconComponent, {
            size: 20,
            color: "white",
            absoluteStrokeWidth: true,
          })
        );
        el.innerHTML = iconHtml;

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
              ${craftsman.email === "manciubogdan999@gmail.com" ? 
                `<p class="text-sm font-bold text-red-500">Email: ${craftsman.email}</p>` : ''}
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

        const handlePopupClick = async (e: Event) => {
          const target = e.target as HTMLElement;
          const button = target.closest('button');
          if (!button) return;

          const userId = await getCurrentUserId();

          if (button.hasAttribute('data-craftsman-id')) {
            if (userId) {
              await recordProfileInteraction(craftsman.id, userId, 'profile_view');
            }
            onCraftsmanClick(craftsman);
          } else if (button.hasAttribute('data-phone')) {
            const phone = button.getAttribute('data-phone');
            if (phone) {
              if (userId) {
                await recordProfileInteraction(craftsman.id, userId, 'phone_click');
              }
              window.location.href = `tel:${phone}`;
            }
          }
        };

        popupContent.addEventListener('click', handlePopupClick);

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup',
        }).setDOMContent(popupContent);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([craftsman.longitude, craftsman.latitude])
          .setPopup(popup)
          .addTo(map.current!);

        if (craftsman.email === "manciubogdan999@gmail.com") {
          marker.togglePopup();
        }

        el.addEventListener('click', async () => {
          const userId = await getCurrentUserId();
          if (userId) {
            await recordProfileInteraction(craftsman.id, userId, 'map_click');
          }
        });

        markersRef.current.push(marker);
        
        bounds.extend([craftsman.longitude, craftsman.latitude]);
        
        console.log(`S-a adăugat marker pentru meșterul ${craftsman.id}`);
      } catch (error) {
        console.error(`Eroare la adăugarea marker-ului pentru meșterul ${craftsman.id}:`, error);
      }
    });

    console.log(`Total markeri adăugați pe hartă: ${markersRef.current.length}`);
    
    if (!bounds.isEmpty() && map.current) {
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15
      });
      
      console.log("Vizualizarea hărții a fost ajustată pentru a încadra toți markerii");
    } else {
      console.warn("Nu există limite pentru a încadra - fie nu există markeri, fie calculul limitelor a eșuat");
      
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
