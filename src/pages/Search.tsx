
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
  email?: string;
  trade?: {
    name: string;
  } | null;
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

  // Get user's location and update it every 10 seconds
  useEffect(() => {
    const getUserLocation = () => {
      // Attempt to get user location
      if (navigator.geolocation) {
        console.log("Solicitare locație utilizator...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Locația utilizatorului obținută cu succes:", position.coords.latitude, position.coords.longitude);
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            
            // If user is a craftsman, update their location in the database
            if (user) {
              updateCraftsmanLocation(position.coords.latitude, position.coords.longitude);
            }
          },
          (error) => {
            console.error("Eroare la obținerea locației:", error);
            toast.error("Nu am putut obține locația ta. Te rugăm să activezi serviciile de localizare.");
            
            // Set default location for Romania if geolocation fails
            setUserLocation({
              lat: 45.9443, // Default latitude for Romania
              lng: 25.0094  // Default longitude for Romania
            });
          }, 
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        console.log("Geolocația nu este suportată, se folosește locația implicită pentru România");
        // Fallback for browsers without geolocation
        setUserLocation({
          lat: 45.9443, // Default latitude for Romania
          lng: 25.0094  // Default longitude for Romania
        });
      }
    };

    // Start geolocation process immediately
    getUserLocation();

    // Set up an interval to refresh location every 10 seconds
    const locationInterval = setInterval(getUserLocation, 10 * 1000);
    
    return () => clearInterval(locationInterval);
  }, [user]);

  // Function to update craftsman location in the database
  const updateCraftsmanLocation = async (latitude: number, longitude: number) => {
    if (!user) return;

    try {
      // Fetch the current user's profile to check if they are a craftsman
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      // Only update location if the user is a craftsman
      if (profile && profile.role === 'professional') {
        console.log("Actualizare locație meșter:", latitude, longitude);
        
        const { error } = await supabase
          .from('profiles')
          .update({
            latitude: latitude,
            longitude: longitude,
            last_location_update: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) {
          console.error("Eroare la actualizarea locației meșterului:", error);
        } else {
          console.log("Locația meșterului a fost actualizată cu succes");
        }
      }
    } catch (error) {
      console.error("Eroare la verificarea/actualizarea profilului:", error);
    }
  };

  // Fetch craftsmen data with 10 second refresh
  const { data: craftsmen = [], isLoading } = useQuery({
    queryKey: ["craftsmen", searchTerm, selectedType, maxDistance, minRating, userLocation],
    queryFn: async () => {
      console.log("Se preiau meșterii cu parametrii:", {
        searchTerm,
        selectedType,
        maxDistance,
        minRating,
        userLocation
      });
      
      try {
        // Use a simpler query to get all professionals without role checks
        let query = supabase
          .from("user_profiles_with_email")
          .select(`
            *,
            reviews!reviews_craftsman_id_fkey(rating),
            trade:craftsman_type(name)
          `)
          .eq("role", "professional");  // Filter only for professional users (craftsmen)

        // Log the query to debug
        console.log("Executing query for professionals");

        // Execute query
        const { data: craftsmenData, error } = await query;

        if (error) {
          console.error("Eroare la preluarea meșterilor:", error);
          throw error;
        }

        console.log("Date despre meșteri obținute:", craftsmenData?.length || 0);
        
        if (!craftsmenData || craftsmenData.length === 0) {
          console.warn("Nu s-au găsit meșteri în baza de date!");
          return [];
        }
        
        // Log each craftsman with their coordinates for debugging
        craftsmenData.forEach(craftsman => {
          console.log(`Meșter: ${craftsman.first_name} ${craftsman.last_name}, ID: ${craftsman.id}`);
          console.log(`  Coordonate: lat=${craftsman.latitude}, long=${craftsman.longitude}`);
          console.log(`  Email: ${craftsman.email}`);
          console.log(`  Role: ${craftsman.role}`);
        });
        
        // Process craftsmen data
        const processedCraftsmen = craftsmenData.map((craftsman): Craftsman => {
          // Calculate average rating
          const reviews = Array.isArray(craftsman.reviews) ? craftsman.reviews : [];
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
            : 0;

          // Build processed craftsman object
          return {
            ...craftsman,
            average_rating: avgRating,
            latitude: typeof craftsman.latitude === 'number' ? craftsman.latitude : null,
            longitude: typeof craftsman.longitude === 'number' ? craftsman.longitude : null,
            email: craftsman.email
          };
        });

        // Count craftsmen with valid coordinates
        const craftsmenWithCoordinates = processedCraftsmen.filter(c => 
          c.latitude !== null && c.longitude !== null);
          
        console.log(`Meșteri cu coordonate valide: ${craftsmenWithCoordinates.length} din ${processedCraftsmen.length}`);
        
        // Return all craftsmen, including those without coordinates
        return processedCraftsmen;
      } catch (error) {
        console.error("Error in fetchCraftsmen:", error);
        toast.error("A apărut o eroare la preluarea datelor despre meșteri");
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }, []);

  // Convert degrees to radians
  const toRad = useCallback((value: number) => {
    return (value * Math.PI) / 180;
  }, []);

  // Handle craftsman click
  const handleCraftsmanClick = useCallback((craftsman: Craftsman) => {
    navigate(`/profile/${craftsman.id}`);
  }, [navigate]);

  if (!user) {
    return null;
  }

  // Calculate craftsmen with valid coordinates for display
  const craftsmenWithCoordinates = craftsmen.filter(c => 
    c.latitude !== null && c.longitude !== null
  ).length;
  
  // Filter craftsmen based on active filters for sidebar
  const filteredCraftsmen = craftsmen.filter((craftsman) => {
    // Apply rating filter
    if ((craftsman.average_rating || 0) < minRating) {
      return false;
    }

    // Apply search term filter
    if (searchTerm && !`${craftsman.first_name} ${craftsman.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Apply type filter
    if (selectedType && craftsman.craftsman_type !== selectedType) {
      return false;
    }

    // Apply distance filter only if user location is available
    if (userLocation && craftsman.latitude !== null && craftsman.longitude !== null) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        craftsman.latitude,
        craftsman.longitude
      );
      
      if (distance > maxDistance) {
        return false;
      }
    }

    return true;
  });
  
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
            craftsmen={filteredCraftsmen}
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
