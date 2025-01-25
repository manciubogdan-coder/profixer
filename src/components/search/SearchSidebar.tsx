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
import { Star } from "lucide-react";
import type { Craftsman } from "@/pages/Search";

interface SearchSidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  craftsmen: Craftsman[];
  isLoading: boolean;
}

export const SearchSidebar = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  craftsmen,
  isLoading,
}: SearchSidebarProps) => {
  return (
    <div className="w-96 border-r bg-background p-6 overflow-y-auto">
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
            value={selectedType || ""}
            onValueChange={(value) => setSelectedType(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alege meseria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate</SelectItem>
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

        <div className="space-y-4">
          <h3 className="font-medium">Rezultate</h3>
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
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {craftsman.first_name} {craftsman.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {craftsman.city}, {craftsman.county}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};