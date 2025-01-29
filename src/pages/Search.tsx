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

export type Craftsman = Tables<"profiles"> & {
  latitude?: number;
  longitude?: number;
  average_rating?: number;
  trade?: {
    name: string;
  } | null;
};

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      let query = supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          phone,
          country,
          county,
          city,
          address,
          role,
          created_at,
          updated_at,
          avatar_url,
          craftsman_type,
          latitude,
          longitude,
          last_location_update,
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

      // Process the data to ensure it's serializable
      const processedCraftsmen = craftsmenData.map((craftsman): Craftsman => {
        const reviews = craftsman.reviews as { rating: number }[] || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Create a serializable object that matches the Craftsman type
        return {
          id: craftsman.id,
          first_name: craftsman.first_name,
          last_name: craftsman.last_name,
          phone: craftsman.phone,
          country: craftsman.country,
          county: craftsman.county,
          city: craftsman.city,
          address: craftsman.address,
          role: craftsman.role,
          created_at: craftsman.created_at,
          updated_at: craftsman.updated_at,
          avatar_url: craftsman.avatar_url,
          craftsman_type: craftsman.craftsman_type,
          latitude: craftsman.latitude,
          longitude: craftsman.longitude,
          last_location_update: craftsman.last_location_update,
          average_rating: avgRating,
          trade: craftsman.trade ? { name: craftsman.trade.name } : null
        };
      });

      // Filter based on rating and distance
      return processedCraftsmen.filter((craftsman) => {
        if ((craftsman.average_rating || 0) < minRating) return false;

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
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
        <Map 
          craftsmen={craftsmen} 
          userLocation={userLocation}
          onCraftsmanClick={handleCraftsmanClick}
        />
      </div>
    </div>
  );
};

export default Search;