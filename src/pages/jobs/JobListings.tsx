
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, MapPin, Wallet, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const JobListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a vedea lucrările");
      navigate("/auth");
      return;
    }

    if (userProfile && userProfile.role !== 'craftsman') {
      toast.error("Această pagină este disponibilă doar pentru meșteri");
      navigate("/");
    }
  }, [user, userProfile, navigate]);

  const { data: jobListings = [], isLoading, refetch } = useQuery({
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
    enabled: !!user && userProfile?.role === 'craftsman',
  });

  const handleStatusChange = async (jobId: string, newStatus: 'open' | 'closed') => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast.success(`Starea lucrării a fost actualizată`);
      refetch();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error("Nu s-a putut actualiza starea lucrării");
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobToDelete);

      if (error) throw error;

      toast.success("Lucrarea a fost ștearsă");
      refetch();
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error("Nu s-a putut șterge lucrarea");
    }
  };

  const renderJobCard = (job: any) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            {job.trade?.name && (
              <Badge variant="secondary" className="mb-2">
                {job.trade.name}
              </Badge>
            )}
          </div>
          <div className="flex items-start gap-2">
            <Badge 
              variant={job.status === 'open' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {job.status === 'open' ? 'Activ' : 'Închis'}
            </Badge>
            {user.id === job.client_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(job.id, job.status === 'open' ? 'closed' : 'open')}
                  >
                    {job.status === 'open' ? 'Marchează ca închis' : 'Redeschide lucrarea'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setJobToDelete(job.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Șterge lucrarea
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
  );

  if (!user || (userProfile && userProfile.role !== 'craftsman')) {
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
            {jobListings.map(renderJobCard)}
          </div>
        )}

        <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ești sigur că vrei să ștergi această lucrare?</AlertDialogTitle>
              <AlertDialogDescription>
                Această acțiune nu poate fi anulată. Lucrarea va fi ștearsă definitiv.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anulează</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Șterge</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default JobListings;
