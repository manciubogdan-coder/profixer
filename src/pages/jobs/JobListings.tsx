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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Wallet, 
  MoreVertical, 
  Trash2, 
  MessageSquare,
  Phone,
  Image,
  Filter
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JobListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    title: "",
    county: "",
    city: "",
    tradeId: "",
    status: "",
  });

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

  const { data: trades = [] } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
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
    queryKey: ["jobListings", filters],
    queryFn: async () => {
      console.log("Fetching job listings with filters:", filters);
      let query = supabase
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

      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      if (filters.county) {
        query = query.ilike('county', `%${filters.county}%`);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.tradeId && filters.tradeId !== 'all') {
        query = query.eq('trade_id', filters.tradeId);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching job listings:", error);
        throw error;
      }

      console.log("Job listings data:", data);
      return data;
    },
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

  const FiltersContent = () => (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="title">Numele lucrării</Label>
        <Input
          id="title"
          placeholder="Caută după nume..."
          value={filters.title}
          onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="county">Județ</Label>
        <Input
          id="county"
          placeholder="Ex: Cluj"
          value={filters.county}
          onChange={(e) => setFilters(prev => ({ ...prev, county: e.target.value }))}
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Oraș</Label>
        <Input
          id="city"
          placeholder="Ex: Cluj-Napoca"
          value={filters.city}
          onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trade">Tip de meșter</Label>
        <Select
          value={filters.tradeId}
          onValueChange={(value) => setFilters(prev => ({ ...prev, tradeId: value }))}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Alege tipul de meșter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            {trades.map((trade) => (
              <SelectItem key={trade.id} value={trade.id}>
                {trade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Alege status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="open">Active</SelectItem>
            <SelectItem value="closed">Închise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filters.title || filters.county || filters.city || filters.tradeId !== "" || filters.status !== "") && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setFilters({
            title: "",
            county: "",
            city: "",
            tradeId: "",
            status: "",
          })}
        >
          Resetează filtrele
        </Button>
      )}
    </div>
  );

  const renderJobCard = (job: any) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow bg-white">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-xl font-bold break-words leading-tight">
              {job.title}
            </CardTitle>
            {job.trade?.name && (
              <Badge variant="secondary" className="inline-block">
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
          <div className="text-sm text-muted-foreground mt-4">
            <p className="font-medium break-words">
              Client: {job.client?.first_name} {job.client?.last_name}
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-2">
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
      </CardContent>
    </Card>
  );

  if (!user || (userProfile && userProfile.role !== 'professional')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lucrări Disponibile</h1>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filtrează
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtrează lucrările</SheetTitle>
                <SheetDescription>
                  Ajustează filtrele pentru a găsi lucrările care te interesează
                </SheetDescription>
              </SheetHeader>
              <FiltersContent />
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block w-full max-w-xs bg-white rounded-lg shadow-sm p-4">
            <FiltersContent />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600">Se încarcă...</div>
        ) : jobListings.length === 0 ? (
          <div className="text-center text-gray-600">
            Nu există lucrări disponibile care să corespundă criteriilor tale.
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
