import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types";

interface MapProps {
  craftsmen: Profile[];
  onCraftsmanClick: (craftsman: Profile) => void;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibWFuY2l1Ym9nZGFuIiwiYSI6ImNscmh3Z2FyeTBwc2Uya3BpeDU2OWdvemoifQ.zvqaE-ZGaEDDhxI5RZVm8A";

mapboxgl.accessToken = MAPBOX_TOKEN;

const Map = ({ craftsmen }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();

  const [lng] = useState(26.1025);
  const [lat] = useState(44.4268);
  const [zoom] = useState(12);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    craftsmen.forEach((craftsman) => {
      if (!craftsman.latitude || !craftsman.longitude) return;

      // Create custom element for marker
      const el = document.createElement("div");
      el.className = "marker";

      // Define icon based on craftsman type
      let iconHtml = "";
      switch (craftsman.craftsman_type) {
        case "carpenter":
          iconHtml = `<svg class="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 6v5h1.5v1.5h1.5V15h1.5v3H22V6h-9Zm7 10h-3v-1.5h-1.5v-1.5H14V8h6v8ZM3.5 12h5v1.5H10V15h1.5v3H17V6H8v5H6.5v1.5h-5V12Zm5 4.5h3v-1.5H10v-1.5H8.5V8H15v10H6.5v-1.5Z"/>
          </svg>`;
          break;
        case "plumber":
          iconHtml = `<svg class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 12c.93 0 1.78.347 2.427 1.003.653.65 1.073 1.552 1.073 2.547 0 .995-.42 1.897-1.073 2.547-.647.656-1.497 1.003-2.427 1.003h-15c-.93 0-1.78-.347-2.427-1.003C1.42 17.447 1 16.545 1 15.55c0-.995.42-1.897 1.073-2.547C2.72 12.347 3.57 12 4.5 12h15zm0 2h-15c-.517 0-.987.193-1.327.537-.34.343-.573.817-.573 1.013 0 .196.233.67.573 1.013.34.344.81.537 1.327.537h15c.517 0 .987-.193 1.327-.537.34-.343.573-.817.573-1.013 0-.196-.233-.67-.573-1.013-.34-.344-.81-.537-1.327-.537zM4.5 4c.93 0 1.78.347 2.427 1.003.653.65 1.073 1.552 1.073 2.547 0 .995-.42 1.897-1.073 2.547-.647.656-1.497 1.003-2.427 1.003h-3c-.93 0-1.78-.347-2.427-1.003C1.42 9.447 1 8.545 1 7.55c0-.995.42-1.897 1.073-2.547C2.72 4.347 3.57 4 4.5 4h3zm0 2h-3c-.517 0-.987.193-1.327.537-.34.343-.573.817-.573 1.013 0 .196.233.67.573 1.013.34.344.81.537 1.327.537h3c.517 0 .987-.193 1.327-.537.34-.343.573-.817.573-1.013 0-.196-.233-.67-.573-1.013-.34-.344-.81-.537-1.327-.537z"/>
          </svg>`;
          break;
        case "electrician":
          iconHtml = `<svg class="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z"/>
          </svg>`;
          break;
        default:
          iconHtml = `<svg class="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>`;
      }

      el.innerHTML = iconHtml;

      // Create a unique ID for the button
      const buttonId = `craftsman-${craftsman.id}`;

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
                id="${buttonId}"
                class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
              >
                Vezi profilul
              </button>
            </div>
          `)
        )
        .addTo(map.current);

      // Add click handler for the button after popup is opened
      marker.getPopup().on('open', () => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.onclick = () => navigate(`/profile/${craftsman.id}`);
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [craftsmen, navigate]);

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;