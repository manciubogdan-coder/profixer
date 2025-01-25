import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SearchSidebar } from "@/components/search/SearchSidebar";
import { Map } from "@/components/search/Map";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Enums } from "@/integrations/supabase/types";

export type Craftsman = Tables<"profiles"> & {
  latitude?: number;
  longitude?: number;
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<Enums<"craftsman_type"> | null>(null);

  const { data: craftsmen = [], isLoading } = useQuery({
    queryKey: ["craftsmen", searchTerm, selectedType],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "professional");

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      if (selectedType) {
        query = query.eq("craftsman_type", selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching craftsmen:", error);
        return [];
      }

      // Simulate coordinates for demo purposes
      // In a real app, these would come from the database
      return data.map((craftsman) => ({
        ...craftsman,
        latitude: 46.7712 + Math.random() * 0.1,
        longitude: 23.6236 + Math.random() * 0.1,
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex h-[calc(100vh-3.5rem)]">
        <SearchSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          craftsmen={craftsmen}
          isLoading={isLoading}
        />
        <Map craftsmen={craftsmen} />
      </div>
    </div>
  );
};

export default Search;