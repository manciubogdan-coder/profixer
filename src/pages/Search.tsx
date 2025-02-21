
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
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Nu am putut obține locația ta. Te rugăm să activezi serviciile de localizare.");
        }
      );
    }
  }, []);

  const { data: craftsmen = [], isLoading } = useQuery({
    queryKey: ["craftsmen", searchTerm, selectedType, maxDistance, minRating, userLocation],
    queryFn: async () => {
      console.log("Fetching craftsmen...");
      
      // Primul query pentru a obține profilurile meșterilor
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
        return [];
      }

      // Al doilea query pentru a obține statusul abonamentelor
      const { data: subscriptionStatuses, error: subError } = await supabase
        .from("craftsman_subscription_status")
        .select("*");

      if (subError) {
        console.error("Error fetching subscription statuses:", subError);
        return [];
      }

      // Creăm un obiect pentru a accesa rapid statusurile abonamentelor
      const statusMap: Record<string, boolean> = {};
      subscriptionStatuses.forEach((status: { craftsman_id: string; is_subscription_active: boolean }) => {
        statusMap[status.craftsman_id] = status.is_subscription_active;
      });

      console.log("Raw craftsmen data:", craftsmenData);
      console.log("Subscription statuses:", subscriptionStatuses);

      const processedCraftsmen = craftsmenData
        .map((craftsman): Craftsman => {
          const reviews = Array.isArray(craftsman.reviews) ? craftsman.reviews : [];
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            ...craftsman,
            average_rating: avgRating,
            subscription_status: {
              is_subscription_active: statusMap[craftsman.id] || false
            }
          };
        })
        .filter((craftsman) => {
          // Filtrăm inițial după rating minim
          if ((craftsman.average_rating || 0) < minRating) return false;

          // Apoi verificăm distanța dacă avem locația utilizatorului
          if (userLocation && craftsman.latitude && craftsman.longitude) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              craftsman.latitude,
              craftsman.longitude
            );
            if (distance > maxDistance) return false;
          }

          return true;
        });

      return processedCraftsmen;
    },
    enabled: !!user,
  });

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
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

  const toggleView = () => {
    setShowMap(!showMap);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {isMobile && (
        <div className="p-2 bg-card border-b flex justify-center gap-2">
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
      <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
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
          <Map 
            craftsmen={craftsmen} 
            userLocation={userLocation}
            onCraftsmanClick={handleCraftsmanClick}
          />
        )}
      </div>
    </div>
  );
};

export default Search;
