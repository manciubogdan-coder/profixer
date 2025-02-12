
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface PlatformStats {
  total_users: number;
  total_jobs: number;
  total_professionals: number;
  total_clients: number;
}

interface SubscriptionStats {
  active_subscriptions: number;
  inactive_subscriptions: number;
  total_subscribers: number;
  expired_subscriptions: number;
  valid_subscriptions: number;
}

interface ProfessionalSubscription {
  id: string;
  craftsman_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'inactive' | 'canceled';
  end_date: string;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalSubscription[]>([]);
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Statistici generale
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
          
        const { count: totalJobs } = await supabase
          .from("job_listings")
          .select("*", { count: "exact", head: true });
          
        const { count: totalProfessionals } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "professional");
          
        const { count: totalClients } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "client");
          
        setStats({
          total_users: totalUsers || 0,
          total_jobs: totalJobs || 0,
          total_professionals: totalProfessionals || 0,
          total_clients: totalClients || 0,
        });

        // Statistici abonamente
        const { data: subscriptionStats } = await supabase
          .from('subscription_statistics')
          .select('*')
          .single();
        
        if (subscriptionStats) {
          setSubStats(subscriptionStats);
        }

        // Lista profesioniști cu abonamente
        const { data: professionalSubs, error: subsError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            craftsman_id,
            status,
            end_date,
            profiles!subscriptions_craftsman_id_fkey (
              first_name,
              last_name,
              email
            )
          `)
          .order('end_date', { ascending: false });

        if (subsError) throw subsError;

        if (professionalSubs) {
          setProfessionals(professionalSubs.map(sub => ({
            id: sub.id,
            craftsman_id: sub.craftsman_id,
            status: sub.status,
            end_date: sub.end_date,
            first_name: sub.profiles.first_name,
            last_name: sub.profiles.last_name,
            email: sub.profiles.email
          })));
        }
      } catch (error) {
        console.error("Eroare la încărcarea statisticilor:", error);
        toast.error("Nu am putut încărca statisticile");
      }
    };
    
    fetchStats();
  }, []);

  const updateSubscriptionEndDate = async (subscriptionId: string) => {
    if (!selectedEndDate) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          end_date: selectedEndDate.toISOString(),
          status: 'active'
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success("Abonamentul a fost actualizat cu succes");
      setSelectedEndDate(undefined);
      setSelectedProfessionalId(null);
      
      // Reîncărcăm datele
      window.location.reload();
    } catch (error) {
      console.error("Eroare la actualizarea abonamentului:", error);
      toast.error("Nu am putut actualiza abonamentul");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Utilizatori Totali</CardTitle>
            <CardDescription>Numărul total de utilizatori înregistrați</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Anunțuri Active</CardTitle>
            <CardDescription>Numărul total de anunțuri postate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_jobs || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Abonamente Active</CardTitle>
            <CardDescription>Numărul de abonamente active</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subStats?.active_subscriptions || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Abonamente Expirate</CardTitle>
            <CardDescription>Numărul de abonamente expirate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{subStats?.expired_subscriptions || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Managementul Abonamentelor</CardTitle>
          <CardDescription>
            Gestionează abonamentele meșterilor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Expirării</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>
                    {professional.first_name} {professional.last_name}
                  </TableCell>
                  <TableCell>{professional.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      professional.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {professional.status === 'active' ? 'Activ' : 'Inactiv'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {professional.end_date 
                      ? format(new Date(professional.end_date), 'dd/MM/yyyy')
                      : 'Nesetat'}
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px]">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedEndDate && professional.id === selectedProfessionalId
                            ? format(selectedEndDate, 'dd/MM/yyyy')
                            : 'Selectează data expirării'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedEndDate}
                          onSelect={(date) => {
                            setSelectedEndDate(date);
                            setSelectedProfessionalId(professional.id);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Button
                            onClick={() => updateSubscriptionEndDate(professional.id)}
                            disabled={!selectedEndDate || selectedProfessionalId !== professional.id}
                            className="w-full"
                          >
                            Actualizează abonamentul
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
