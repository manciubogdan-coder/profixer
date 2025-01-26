import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SearchSidebar } from "@/components/search/SearchSidebar";
import { Map } from "@/components/search/Map";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Enums } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

export type Craftsman = Tables<"profiles"> & {
  latitude?: number;
  longitude?: number;
};

type CraftsmanType = Enums<"craftsman_type"> | "all";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<CraftsmanType | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCraftsman, setSelectedCraftsman] = useState<Craftsman | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
          toast({
            title: "Eroare",
            description: "Nu am putut obține locația ta. Te rugăm să activezi serviciile de localizare.",
            variant: "destructive",
          });
        }
      );
    }
  }, []);

  // Update craftsman location periodically if they are a professional
  useEffect(() => {
    const updateLocation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "professional") return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { error } = await supabase
            .from("profiles")
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              last_location_update: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (error) {
            console.error("Error updating location:", error);
          }
        });
      }
    };

    const interval = setInterval(updateLocation, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const { data: craftsmen = [], isLoading } = useQuery({
    queryKey: ["craftsmen", searchTerm, selectedType, maxDistance, minRating, userLocation],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          *,
          reviews!reviews_craftsman_id_fkey(rating)
        `)
        .eq("role", "professional");

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      if (selectedType && selectedType !== "all") {
        query = query.eq("craftsman_type", selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching craftsmen:", error);
        return [];
      }

      return data
        .map((craftsman) => {
          // Calculate average rating
          const ratings = craftsman.reviews as { rating: number }[];
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

          // Filter by rating
          if (avgRating < minRating) return null;

          // Filter by distance if user location is available
          if (userLocation && craftsman.latitude && craftsman.longitude) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              craftsman.latitude,
              craftsman.longitude
            );
            if (distance > maxDistance) return null;
          }

          return craftsman;
        })
        .filter(Boolean) as Craftsman[];
    },
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number) => {
    return (value * Math.PI) / 180;
  };

  const handleCraftsmanClick = (craftsman: Craftsman) => {
    navigate(`/profile/${craftsman.id}`);
  };

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
