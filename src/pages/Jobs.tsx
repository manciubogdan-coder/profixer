import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobListingCard } from "@/components/jobs/JobListingCard";
import { CreateJobDialog } from "@/components/jobs/CreateJobDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Jobs() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user } = useAuth();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log("Fetching jobs...");
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          client:profiles!job_listings_client_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          trade:trades(
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }

      console.log("Fetched jobs:", data);
      return data.map(job => ({
        ...job,
        images: Array.isArray(job.images) ? job.images : []
      }));
    }
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Lucrări disponibile</h1>
        {user && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adaugă lucrare
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs?.map((job) => (
            <JobListingCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <CreateJobDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}