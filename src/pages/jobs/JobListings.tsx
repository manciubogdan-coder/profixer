import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { 
  CalendarDays, 
  MapPin, 
  Wallet, 
  MoreVertical, 
  Trash2, 
  MessageSquare,
  Phone,
  Image
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

    if (userProfile && userProfile.role !== 'professional') {
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
            last_name,
            phone
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
    enabled: !!user && userProfile?.role === 'professional',
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

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const renderJobCard = (job: any) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 break-words">{job.title}</CardTitle>
            {job.trade?.name && (
              <Badge variant="secondary" className="mb-2 break-words">
                {job.trade.name}
              </Badge>
            )}
          </div>
          <div className="flex items-start gap-2">
            <Badge 
              variant={job.status === 'open' ? 'default' : 'secondary'}
              className="capitalize whitespace-nowrap"
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
          <div className="text-sm text-muted-foreground mt-4">
            <p className="font-medium break-words">Client: {job.client?.first_name} {job.client?.last_name}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <ChatDialog recipientId={job.client_id} recipientName={`${job.client?.first_name} ${job.client?.last_name}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="whitespace-nowrap">Trimite mesaj</span>
              </Button>
            </ChatDialog>
            {job.client?.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => handlePhoneClick(job.client.phone)}
              >
                <Phone className="h-4 w-4" />
                <span className="whitespace-nowrap">Sună clientul</span>
              </Button>
            )}
            {job.images && job.images.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    <span className="whitespace-nowrap">Vezi poze ({job.images.length})</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[80vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle>Poze atașate lucrării</DialogTitle>
                    <DialogDescription>
                      {job.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {job.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Imagine ${index + 1}`}
                        className="w-full h-auto rounded-lg"
                      />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user || (userProfile && userProfile.role !== 'professional')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Lucrări Disponibile</h1>

        {isLoading ? (
          <div>Se încarcă...</div>
        ) : jobListings.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nu există lucrări disponibile momentan.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobListings.map(renderJobCard)}
          </div>
        )}

        <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
          <AlertDialogContent className="max-w-[95vw] mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Ești sigur că vrei să ștergi această lucrare?</AlertDialogTitle>
              <AlertDialogDescription>
                Această acțiune nu poate fi anulată. Lucrarea va fi ștearsă definitiv.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
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
