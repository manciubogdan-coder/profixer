import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarDays, MapPin, Wallet, Pencil, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const MyJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      toast.error("Trebuie să fii autentificat pentru a vedea lucrările tale");
      navigate("/auth");
      return;
    }

    if (userProfile && userProfile.role !== 'client') {
      toast.error("Această pagină este disponibilă doar pentru clienți");
      navigate("/");
    }
  }, [user, userProfile, navigate]);

  const { data: myJobs = [], isLoading, refetch } = useQuery({
    queryKey: ["myJobs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("job_listings")
        .select(`
          *,
          trade:trades(
            name
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching my jobs:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user && userProfile?.role === 'client',
  });

  const handleDelete = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast.success("Lucrarea a fost ștearsă cu succes");
      refetch();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error("A apărut o eroare la ștergerea lucrării");
    }
  };

  const handleEdit = (jobId: string) => {
    navigate(`/jobs/edit/${jobId}`);
  };

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    try {
      // Ensure we only use valid status values
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      
      const { error } = await supabase
        .from('job_listings')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job status:', error);
        toast.error("A apărut o eroare la actualizarea statusului");
        return;
      }

      toast.success(`Statusul lucrării a fost schimbat în ${newStatus === 'open' ? 'Activ' : 'Închis'}`);
      refetch();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error("A apărut o eroare la actualizarea statusului");
    }
  };

  const renderJobCard = (job: any) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 break-words">{job.title}</CardTitle>
            {job.trade?.name && (
              <Badge variant="secondary" className="mb-2 break-words">
                {job.trade.name}
              </Badge>
            )}
          </div>
          <Button
            variant={job.status === 'open' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => handleStatusToggle(job.id, job.status)}
            className="capitalize whitespace-nowrap"
          >
            {job.status === 'open' ? 'Activ' : 'Închis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 break-words">
            {job.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="break-words">{job.city}, {job.county}</span>
            </div>
            {job.budget && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Wallet className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{job.budget} RON</span>
              </div>
            )}
            {job.start_date && (
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="break-words">Data începerii: {new Date(job.start_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(job.id)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              <span className="whitespace-nowrap">Editează</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="whitespace-nowrap">Șterge</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[95vw] mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Această acțiune nu poate fi anulată. Lucrarea va fi ștearsă definitiv.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDelete(job.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Șterge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user || (userProfile && userProfile.role !== 'client')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Lucrările Mele</h1>

        {isLoading ? (
          <div>Se încarcă...</div>
        ) : myJobs.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nu ai adăugat nicio lucrare încă.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {myJobs.map(renderJobCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
