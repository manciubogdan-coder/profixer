import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, MapPin, Wallet } from "lucide-react";

const JobListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a vedea lucrările");
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: jobListings = [], isLoading } = useQuery({
    queryKey: ["jobListings"],
    queryFn: async () => {
      console.log("Fetching job listings...");
      const { data, error } = await supabase
        .from("job_listings")
        .select(`
          *,
          client:profiles!job_listings_client_id_fkey(
            first_name,
            last_name
          ),
          trade:trades(
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching job listings:", error);
        throw error;
      }

      console.log("Job listings data:", data);
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Lucrări Disponibile</h1>
        {isLoading ? (
          <div>Se încarcă...</div>
        ) : jobListings.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nu există lucrări disponibile momentan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobListings.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      {job.trade?.name && (
                        <Badge variant="secondary" className="mb-2">
                          {job.trade.name}
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={job.status === 'open' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {job.status === 'open' ? 'Activ' : 'Închis'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.city}, {job.county}</span>
                    </div>
                    {job.budget && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4 mr-2" />
                        <span>{job.budget} RON</span>
                      </div>
                    )}
                    {job.start_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        <span>Data începerii: {new Date(job.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-4">
                      Postat de: {job.client?.first_name} {job.client?.last_name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;