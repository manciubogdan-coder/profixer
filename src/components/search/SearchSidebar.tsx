
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import type { Craftsman } from "@/pages/Search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchSidebarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: string | null;
  setSelectedType: (value: string | null) => void;
  craftsmen: Craftsman[];
  isLoading: boolean;
  maxDistance: number;
  setMaxDistance: (value: number) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  onCraftsmanClick: (craftsman: Craftsman) => void;
}

export const SearchSidebar = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  craftsmen,
  isLoading,
  maxDistance,
  setMaxDistance,
  minRating,
  setMinRating,
  onCraftsmanClick,
}: SearchSidebarProps) => {
  const isMobile = useIsMobile();
  
  const { data: types } = useQuery({
    queryKey: ["craftsman-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Filtrăm meșterii pentru a afișa doar pe cei cu abonament activ
  const activeCraftsmen = craftsmen.filter(
    (craftsman) => craftsman.subscription_status?.is_subscription_active === true
  );

  return (
    <div className={`w-full ${isMobile ? 'h-[calc(100vh-7rem)]' : 'md:w-96'} p-4 border-r bg-card`}>
      <div className="space-y-4">
        <Input
          placeholder="Caută după nume..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          defaultValue="all"
          value={selectedType ?? "all"}
          onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alege meseria..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate meseriile</SelectItem>
            {types?.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Distanța maximă: {maxDistance} km
          </label>
          <Slider
            value={[maxDistance]}
            onValueChange={(values) => setMaxDistance(values[0])}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Rating minim: {minRating} stele
          </label>
          <Slider
            value={[minRating]}
            onValueChange={(values) => setMinRating(values[0])}
            max={5}
            step={0.5}
          />
        </div>

        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-20rem)]' : 'h-[calc(100vh-24rem)]'}`}>
          <div className="space-y-2 pr-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Se încarcă...</p>
            ) : activeCraftsmen.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nu au fost găsiți meșteri care să corespundă criteriilor.
              </p>
            ) : (
              activeCraftsmen.map((craftsman) => (
                <Card
                  key={craftsman.id}
                  className="p-4 cursor-pointer hover:bg-accent"
                  onClick={() => onCraftsmanClick(craftsman)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {craftsman.first_name} {craftsman.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {craftsman.trade?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm">
                          {craftsman.average_rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {craftsman.city}, {craftsman.county}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
