
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

  // Get user's location
  useEffect(() => {
    const getUserLocation = () => {
      // Attempt to get user location
      if (navigator.geolocation) {
        console.log("Requesting user location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("User location obtained successfully:", position.coords.latitude, position.coords.longitude);
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
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
        console.log("Geolocation not supported, using default Romania location");
        // Fallback for browsers without geolocation
        setUserLocation({
          lat: 45.9443, // Default latitude for Romania
          lng: 25.0094  // Default longitude for Romania
        });
      }
    };

    // Start geolocation process
    getUserLocation();

    // Set up an interval to refresh location every 5 minutes
    const locationInterval = setInterval(getUserLocation, 5 * 60 * 1000);
    
    return () => clearInterval(locationInterval);
  }, []);

  // Fetch craftsmen data
  const { data: craftsmen = [], isLoading } = useQuery({
    queryKey: ["craftsmen", searchTerm, selectedType, maxDistance, minRating, userLocation],
    queryFn: async () => {
      console.log("Fetching craftsmen with params:", {
        searchTerm,
        selectedType,
        maxDistance,
        minRating,
        userLocation
      });
      
      let query = supabase
        .from("profiles")
        .select(`
          *,
          reviews!reviews_craftsman_id_fkey(rating),
          trade:craftsman_type(name),
          subscription_status:subscriptions(status)
        `)
        .eq("role", "professional");

      // Add search term filter if provided
      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      // Add type filter if provided
      if (selectedType) {
        query = query.eq("craftsman_type", selectedType);
      }

      // Execute query
      const { data: craftsmenData, error } = await query;

      if (error) {
        console.error("Error fetching craftsmen:", error);
        throw error;
      }

      console.log("Fetched craftsmen data:", craftsmenData?.length || 0);
      
      // Log sample data for debugging
      if (craftsmenData && craftsmenData.length > 0) {
        console.log("First craftsman sample:", craftsmenData[0]);
      } else {
        console.log("No craftsmen data returned from the query");
      }

      // Process craftsmen data
      const processedCraftsmen = craftsmenData.map((craftsman): Craftsman => {
        // Calculate average rating
        const reviews = Array.isArray(craftsman.reviews) ? craftsman.reviews : [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
          : 0;

        // Parse latitude and longitude to ensure they're valid numbers
        let lat = null;
        let lng = null;
        
        try {
          if (craftsman.latitude !== null && craftsman.longitude !== null) {
            lat = typeof craftsman.latitude === 'string' 
              ? parseFloat(craftsman.latitude) 
              : Number(craftsman.latitude);
            
            lng = typeof craftsman.longitude === 'string' 
              ? parseFloat(craftsman.longitude) 
              : Number(craftsman.longitude);
            
            // Validate coordinates are within reasonable range
            if (isNaN(lat) || isNaN(lng) || 
                lat < -90 || lat > 90 || 
                lng < -180 || lng > 180) {
              console.warn(`Invalid coordinates for craftsman ${craftsman.id}: lat=${lat}, lng=${lng}`);
              lat = null;
              lng = null;
            }
          } else {
            console.warn(`Missing coordinates for craftsman ${craftsman.id}`);
          }
        } catch (e) {
          console.error(`Error parsing coordinates for craftsman ${craftsman.id}:`, e);
          lat = null;
          lng = null;
        }

        // IMPORTANT: Force all craftsmen to be visible regardless of subscription status
        // This ensures all professionals appear on the map
        const isActive = true;

        // Build processed craftsman object
        return {
          ...craftsman,
          average_rating: avgRating,
          latitude: lat,
          longitude: lng,
          subscription_status: {
            is_subscription_active: isActive
          }
        };
      });

      // Debug log craftsmen coordinates
      processedCraftsmen.forEach((c, idx) => {
        console.log(`[${idx}] Craftsman ${c.id} (${c.first_name} ${c.last_name}):`, 
          "lat:", c.latitude, 
          "lng:", c.longitude, 
          "rating:", c.average_rating,
          "trade:", c.trade?.name);
      });

      // Add current user if they are a professional but not in the results
      try {
        if (user) {
          const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('*, trade:craftsman_type(name)')
            .eq('id', user.id)
            .single();
          
          if (currentUserProfile && currentUserProfile.role === 'professional') {
            const isAlreadyIncluded = processedCraftsmen.some(c => c.id === user.id);
            
            if (!isAlreadyIncluded) {
              console.log("Adding current user (who is a professional) to the craftsmen list:", currentUserProfile);
              
              // Process coordinates for current user
              let userLat = null;
              let userLng = null;
              
              try {
                if (currentUserProfile.latitude !== null && currentUserProfile.longitude !== null) {
                  userLat = typeof currentUserProfile.latitude === 'string' 
                    ? parseFloat(currentUserProfile.latitude) 
                    : Number(currentUserProfile.latitude);
                  
                  userLng = typeof currentUserProfile.longitude === 'string' 
                    ? parseFloat(currentUserProfile.longitude) 
                    : Number(currentUserProfile.longitude);
                }
              } catch (e) {
                console.error("Error parsing coordinates for current user:", e);
              }
              
              const currentUserAsCraftsman: Craftsman = {
                ...currentUserProfile,
                average_rating: 0,
                latitude: userLat,
                longitude: userLng,
                subscription_status: {
                  is_subscription_active: true
                }
              };
              
              processedCraftsmen.push(currentUserAsCraftsman);
            }
          }
        }
      } catch (error) {
        console.error("Error checking current user profile:", error);
      }

      // Filter craftsmen with coordinates
      const craftsmenWithCoordinates = processedCraftsmen.filter(c => 
        c.latitude !== null && c.longitude !== null && 
        typeof c.latitude === 'number' && typeof c.longitude === 'number' &&
        !isNaN(c.latitude) && !isNaN(c.longitude));
        
      console.log(`Craftsmen with valid coordinates: ${craftsmenWithCoordinates.length} out of ${processedCraftsmen.length}`);
      
      // Apply rating filter but not distance filter initially for testing
      const filteredCraftsmen = craftsmenWithCoordinates.filter((craftsman) => {
        // Apply rating filter
        if ((craftsman.average_rating || 0) < minRating) {
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

      console.log("Final craftsmen count after filtering:", filteredCraftsmen.length);
      
      // IMPORTANT: Return all craftsmen with coordinates if filtered list is empty
      // This ensures there's always someone visible on the map for testing
      return filteredCraftsmen.length > 0 ? filteredCraftsmen : craftsmenWithCoordinates;
    },
    enabled: !!user,
    // Refresh every 30 seconds to catch new craftsmen or location updates
    refetchInterval: 30000,
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
    
    console.log(`Distance from user to craftsman: ${distance.toFixed(2)}km`);
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
    c.latitude !== null && c.latitude !== undefined && 
    c.longitude !== null && c.longitude !== undefined &&
    typeof c.latitude === 'number' && typeof c.longitude === 'number' &&
    !isNaN(c.latitude) && !isNaN(c.longitude)
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
