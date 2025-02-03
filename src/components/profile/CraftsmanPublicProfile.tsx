import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CraftsmanStats } from "@/components/profile/CraftsmanStats";
import { CraftsmanPortfolio } from "@/components/profile/CraftsmanPortfolio";
import { CraftsmanReviews } from "@/components/profile/CraftsmanReviews";
import { CraftsmanQualifications } from "@/components/profile/CraftsmanQualifications";
import { CraftsmanSpecializations } from "@/components/profile/CraftsmanSpecializations";
import { CraftsmanMap } from "@/components/profile/CraftsmanMap";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export const CraftsmanPublicProfile = ({ craftsmanId }: { craftsmanId: string }) => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["craftsman-profile", craftsmanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", craftsmanId)
        .single();

      if (error) {
        console.error("Error fetching craftsman profile:", error);
        return null;
      }

      return data;
    },
  });

  const trackInteraction = async (interactionType: string) => {
    if (!user || user.id === craftsmanId) {
      console.log("Not tracking interaction - user is craftsman or not logged in");
      return;
    }
    
    console.log(`Tracking ${interactionType} for craftsman:`, craftsmanId);
    console.log("Visitor ID:", user.id);
    
    try {
      const { error } = await supabase
        .from('profile_interactions')
        .insert({
          craftsman_id: craftsmanId,
          visitor_id: user.id,
          interaction_type: interactionType,
          metadata: { timestamp: new Date().toISOString() }
        });

      if (error) {
        console.error(`Error tracking ${interactionType}:`, error);
        toast.error(`Nu am putut înregistra ${interactionType}`);
      } else {
        console.log(`Successfully tracked ${interactionType}`);
      }
    } catch (error) {
      console.error(`Error in track${interactionType}:`, error);
    }
  };

  useEffect(() => {
    if (user && user.id !== craftsmanId) {
      console.log("Tracking profile view");
      trackInteraction('profile_view');
    }
  }, [craftsmanId, user]);

  const handleMapClick = () => {
    console.log("Map clicked");
    trackInteraction('map_click');
  };

  const handlePhoneClick = () => {
    console.log("Phone clicked");
    trackInteraction('phone_click');
  };

  if (isLoading) {
    return (
      <div className="w-full md:w-1/3">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Profilul nu a fost găsit</h1>
        <p className="text-muted-foreground">
          Ne pare rău, dar profilul căutat nu există sau a fost șters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/3">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{getInitials(`${profile.first_name} ${profile.last_name}`)}</AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <Badge variant="secondary" className="mt-2">
            {profile.craftsman_type}
          </Badge>
          <div className="mt-4 space-y-2">
            <div onClick={handleMapClick} className="cursor-pointer">
              <CraftsmanMap
                latitude={profile.latitude}
                longitude={profile.longitude}
                address={profile.address}
              />
            </div>
            <a 
              href={`tel:${profile.phone}`} 
              onClick={handlePhoneClick}
              className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              {profile.phone}
            </a>
          </div>
        </div>

        <CraftsmanStats craftsmanId={craftsmanId} />
        <CraftsmanSpecializations craftsmanId={craftsmanId} />
        <CraftsmanQualifications craftsmanId={craftsmanId} />
        <CraftsmanPortfolio craftsmanId={craftsmanId} />
        <CraftsmanReviews craftsmanId={craftsmanId} />
      </div>
    </div>
  );
};