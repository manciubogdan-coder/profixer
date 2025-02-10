
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Filter } from "lucide-react";
import type { Craftsman } from "@/pages/Search";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  craftsmen: Craftsman[];
  isLoading: boolean;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
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
  const { data: trades = [], isLoading: isLoadingTrades } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      console.log("Fetching trades...");
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching trades:", error);
        return [];
      }

      console.log("Fetched trades:", data);
      return data;
    },
  });

  const filters = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Caută după nume</Label>
          <Input
            id="search"
            placeholder="ex: instalator, electrician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Meserie</Label>
          <Select
            value={selectedType || "all"}
            onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alege meseria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate meseriile</SelectItem>
              {trades.map((trade) => (
                <SelectItem key={trade.id} value={trade.id}>
                  {trade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Distanța maximă ({maxDistance} km)</Label>
          <Slider
            value={[maxDistance]}
            onValueChange={(value) => setMaxDistance(value[0])}
            max={400}
            step={10}
          />
        </div>

        <div className="space-y-2">
          <Label>Rating minim ({minRating})</Label>
          <Slider
            value={[minRating]}
            onValueChange={(value) => setMinRating(value[0])}
            max={5}
            step={0.5}
            min={0}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-medium">Rezultate</h3>
          <div className="flex flex-wrap gap-2">
            {selectedType && (
              <Badge variant="secondary">
                {trades.find(t => t.id === selectedType)?.name || 'Toate meseriile'}
              </Badge>
            )}
            {maxDistance < 400 && (
              <Badge variant="secondary">
                {maxDistance}km
              </Badge>
            )}
            {minRating > 0 && (
              <Badge variant="secondary">
                ≥{minRating}★
              </Badge>
            )}
          </div>
        </div>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-20 w-full" />
            </div>
          ))
        ) : craftsmen.length === 0 ? (
          <p className="text-muted-foreground">Nu s-au găsit meșteri</p>
        ) : (
          <div className="space-y-4">
            {craftsmen.map((craftsman) => (
              <div
                key={craftsman.id}
                className="rounded-lg border border-border hover:border-primary transition-colors cursor-pointer bg-card"
                onClick={() => onCraftsmanClick(craftsman)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {craftsman.first_name} {craftsman.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {craftsman.city}, {craftsman.county}
                      </p>
                      {craftsman.trade && (
                        <p className="text-sm text-primary">
                          {craftsman.trade.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{craftsman.average_rating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <>
        {/* Desktop sidebar */}
        <div className="hidden md:block w-96 border-r border-border bg-background p-6 overflow-y-auto">
          {filters}
        </div>

        {/* Mobile sidebar */}
        <div className="md:hidden fixed top-[4.5rem] right-4 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="shadow-lg">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrează ({craftsmen.length})
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  {filters}
                </SheetContent>
              </Sheet>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filtrează meșterii după meserie, distanță și rating</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </>
    </TooltipProvider>
  );
};
