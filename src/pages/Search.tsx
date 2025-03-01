
import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { SearchSidebar } from "@/components/search/SearchSidebar";
import { Map } from "@/components/search/Map";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapIcon, ListFilter } from "lucide-react";

export type Craftsman = Tables<"profiles"> & {
  latitude?: number;
  longitude?: number;
  average_rating?: number;
  trade?: {
    name: string;
  } | null;
  subscription_status?: {
    is_subscription_active: boolean;
  };
};

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a căuta meșteri");
      navigate("/auth");
    }
  }, [user, navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(!isMobile);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("User location set:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Nu am putut obține locația ta. Te rugăm să activezi serviciile de localizare.");
          // Set default location for Romania if geolocation fails
          setUserLocation({
            lat: 45.9443, // Default latitude for Romania
            lng: 25.0094  // Default longitude for Romania
          });
        }
      );
    } else {
      // Fallback for browsers without geolocation
      setUserLocation({
        lat: 45.9443, // Default latitude for Romania
        lng: 25.0094  // Default longitude for Romania
      });
    }
  }, []);

  const { data: craftsmen = [], isLoading } = useQuery({
    queryKey: ["craftsmen", searchTerm, selectedType, maxDistance, minRating, userLocation],
    queryFn: async () => {
      console.log("Fetching craftsmen...");
      
      let query = supabase
        .from("profiles")
        .select(`
          *,
          reviews!reviews_craftsman_id_fkey(rating),
          trade:craftsman_type(name)
        `)
        .eq("role", "professional");

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      if (selectedType) {
        query = query.eq("craftsman_type", selectedType);
      }

      const { data: craftsmenData, error } = await query;

      if (error) {
        console.error("Error fetching craftsmen:", error);
        throw error;
      }

      console.log("Fetched craftsmen data:", craftsmenData?.length || 0);
      
      // Log all craftsmen coordinates for debugging
      if (craftsmenData && craftsmenData.length > 0) {
        console.log("Craftsmen with coordinates:");
        craftsmenData.forEach((c, index) => {
          console.log(`[${index}] Craftsman ${c.id}: lat=${c.latitude}, lng=${c.longitude}, name=${c.first_name} ${c.last_name}`);
        });
      } else {
        console.log("No craftsmen data returned from the query");
      }

      const processedCraftsmen = craftsmenData.map((craftsman): Craftsman => {
        const reviews = Array.isArray(craftsman.reviews) ? craftsman.reviews : [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
          : 0;

        // Parse latitude and longitude to ensure they're numbers
        let lat = null;
        let lng = null;
        
        if (craftsman.latitude !== null && craftsman.longitude !== null) {
          lat = parseFloat(String(craftsman.latitude));
          lng = parseFloat(String(craftsman.longitude));
          
          // Validate coordinates are within reasonable range
          if (isNaN(lat) || isNaN(lng) || 
              lat < -90 || lat > 90 || 
              lng < -180 || lng > 180) {
            console.warn(`Invalid coordinates for craftsman ${craftsman.id}: lat=${lat}, lng=${lng}`);
            lat = null;
            lng = null;
          }
        }

        return {
          ...craftsman,
          average_rating: avgRating,
          latitude: lat,
          longitude: lng
        };
      });

      const craftsmenWithCoordinates = processedCraftsmen.filter(c => c.latitude !== null && c.longitude !== null);
      console.log(`Craftsmen with valid coordinates: ${craftsmenWithCoordinates.length} out of ${processedCraftsmen.length}`);
      
      if (craftsmenWithCoordinates.length === 0) {
        console.warn("No craftsmen have valid coordinates");
      }

      // Apply filters
      const filteredCraftsmen = processedCraftsmen.filter((craftsman) => {
        // Skip craftsmen without coordinates for distance filtering only
        if ((craftsman.average_rating || 0) < minRating) return false;

        // Apply distance filter only if we have user location and craftsman has coordinates
        if (userLocation && craftsman.latitude !== null && craftsman.longitude !== null) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            craftsman.latitude,
            craftsman.longitude
          );
          // Debug distance calculation
          console.log(`Distance for craftsman ${craftsman.id}: ${distance.toFixed(2)}km`);
          if (distance > maxDistance) return false;
        }

        return true;
      });

      console.log("Final craftsmen count after filtering:", filteredCraftsmen.length);
      return filteredCraftsmen;
    },
    enabled: !!user,
  });

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const toRad = useCallback((value: number) => {
    return (value * Math.PI) / 180;
  }, []);

  const handleCraftsmanClick = useCallback((craftsman: Craftsman) => {
    navigate(`/profile/${craftsman.id}`);
  }, [navigate]);

  if (!user) {
    return null;
  }

  // Calculate how many craftsmen have valid coordinates
  const craftsmenWithCoordinates = craftsmen.filter(c => 
    c.latitude !== null && c.latitude !== undefined && 
    c.longitude !== null && c.longitude !== undefined
  ).length;
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {isMobile && (
        <div className="sticky top-14 z-10 p-2 bg-card border-b flex justify-center gap-2">
          <Button
            variant={showMap ? "outline" : "default"}
            size="sm"
            onClick={() => setShowMap(false)}
            className="flex items-center gap-2"
          >
            <ListFilter className="h-4 w-4" />
            Listă
          </Button>
          <Button
            variant={showMap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMap(true)}
            className="flex items-center gap-2"
          >
            <MapIcon className="h-4 w-4" />
            Hartă
          </Button>
        </div>
      )}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {(!isMobile || !showMap) && (
          <SearchSidebar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            craftsmen={craftsmen}
            isLoading={isLoading}
            maxDistance={maxDistance}
            setMaxDistance={setMaxDistance}
            minRating={minRating}
            setMinRating={setMinRating}
            onCraftsmanClick={handleCraftsmanClick}
          />
        )}
        {(!isMobile || showMap) && (
          <div className="flex-1 relative">
            <Map 
              craftsmen={craftsmen} 
              userLocation={userLocation}
              onCraftsmanClick={handleCraftsmanClick}
            />
            <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-md text-xs">
              {isLoading ? (
                "Se încarcă..."
              ) : (
                <>Meșteri pe hartă: {craftsmenWithCoordinates} din {craftsmen.length}</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
