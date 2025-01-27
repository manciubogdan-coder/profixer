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
import { Enums } from "@/integrations/supabase/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type CraftsmanType = Enums<"craftsman_type"> | "all";

const craftsmanTypeLabels: Record<Exclude<CraftsmanType, "all">, string> = {
  carpenter: "Tâmplar",
  plumber: "Instalator",
  electrician: "Electrician",
  painter: "Zugrav",
  mason: "Zidar",
  welder: "Sudor",
  locksmith: "Lăcătuș",
  roofer: "Acoperișar",
  hvac_technician: "Tehnician HVAC",
  general_contractor: "Constructor",
};

interface SearchSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: CraftsmanType | null;
  setSelectedType: (type: CraftsmanType | null) => void;
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
  const filters = (
    <div className="space-y-6">
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
          value={selectedType || undefined}
          onValueChange={(value) => setSelectedType(value as CraftsmanType || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alege meseria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="carpenter">Tâmplar</SelectItem>
            <SelectItem value="plumber">Instalator</SelectItem>
            <SelectItem value="electrician">Electrician</SelectItem>
            <SelectItem value="painter">Zugrav</SelectItem>
            <SelectItem value="mason">Zidar</SelectItem>
            <SelectItem value="welder">Sudor</SelectItem>
            <SelectItem value="locksmith">Lăcătuș</SelectItem>
            <SelectItem value="roofer">Acoperișar</SelectItem>
            <SelectItem value="hvac_technician">Tehnician HVAC</SelectItem>
            <SelectItem value="general_contractor">Constructor</SelectItem>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Rezultate</h3>
          {selectedType && (
            <Badge variant="secondary" className="ml-2">
              {selectedType === 'all' ? 'Toate meseriile' : craftsmanTypeLabels[selectedType]}
            </Badge>
          )}
          {maxDistance < 400 && (
            <Badge variant="secondary" className="ml-2">
              {maxDistance}km
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary" className="ml-2">
              ≥{minRating}★
            </Badge>
          )}
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
                className="rounded-lg border p-4 hover:border-primary transition-colors cursor-pointer"
                onClick={() => onCraftsmanClick(craftsman)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {craftsman.first_name} {craftsman.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {craftsman.city}, {craftsman.county}
                    </p>
                    {craftsman.craftsman_type && (
                      <p className="text-sm text-primary">
                        {craftsmanTypeLabels[craftsman.craftsman_type]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{craftsman.average_rating?.toFixed(1) || "N/A"}</span>
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
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-96 border-r bg-background p-6 overflow-y-auto">
        {filters}
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed top-[4.5rem] right-4 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg">
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
  );
};