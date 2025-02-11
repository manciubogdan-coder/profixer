
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PlatformStats {
  total_users: number;
  total_jobs: number;
  total_professionals: number;
  total_clients: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Număr total de utilizatori
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
          
        // Număr total de anunțuri
        const { count: totalJobs } = await supabase
          .from("job_listings")
          .select("*", { count: "exact", head: true });
          
        // Număr de profesioniști
        const { count: totalProfessionals } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "professional");
          
        // Număr de clienți
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
      } catch (error) {
        console.error("Eroare la încărcarea statisticilor:", error);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
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
          <CardTitle>Profesioniști</CardTitle>
          <CardDescription>Numărul total de profesioniști înregistrați</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.total_professionals || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Clienți</CardTitle>
          <CardDescription>Numărul total de clienți înregistrați</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.total_clients || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
};
