
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type DbResult<T> = T extends PromiseLike<infer U> ? U : never;

type DatabaseSubscription = Database['public']['Tables']['subscriptions']['Row'];
type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface Subscription {
  id: string;
  craftsman_id: string;
  craftsman_name: string;
  craftsman_email: string;
  status: "active" | "inactive";
  end_date: string | null;
}

interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
}

export const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeListings: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchSubscriptions();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('role', { count: 'exact' });

      const { data: activeListings } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      const { data: activeSubscriptions } = await supabase
        .from('craftsman_subscription_status')
        .select('*', { count: 'exact' })
        .eq('is_subscription_active', true);

      const { data: expiredSubscriptions } = await supabase
        .from('craftsman_subscription_status')
        .select('*', { count: 'exact' })
        .eq('is_subscription_active', false);

      setStats({
        totalUsers: users?.length || 0,
        activeListings: activeListings?.length || 0,
        activeSubscriptions: activeSubscriptions?.length || 0,
        expiredSubscriptions: expiredSubscriptions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // Fetch professional users with their auth data
      const { data: professionals, error: profError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          auth_user:auth.users(email)
        `)
        .eq('role', 'professional');

      if (profError) throw profError;
      if (!professionals) return;

      // Then fetch their subscription status
      const { data: subscriptionsData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .in('craftsman_id', professionals.map(p => p.id));

      if (subError) throw subError;

      // Combine the data
      const combinedSubscriptions = professionals.map(prof => {
        const subscription = subscriptionsData?.find(s => s.craftsman_id === prof.id);
        const authUser = Array.isArray(prof.auth_user) ? prof.auth_user[0] : null;
        
        return {
          id: prof.id,
          craftsman_id: prof.id,
          craftsman_name: `${prof.first_name} ${prof.last_name}`,
          craftsman_email: authUser?.email || 'N/A',
          status: (subscription?.status === 'active' ? 'active' : 'inactive') as "active" | "inactive",
          end_date: subscription?.end_date || null
        };
      });

      setSubscriptions(combinedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Nu am putut încărca lista de abonamente');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionDate = async (subscriptionId: string, newDate: Date) => {
    try {
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('craftsman_id', subscriptionId)
        .maybeSingle();

      if (!existingSubscription) {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            craftsman_id: subscriptionId,
            end_date: newDate.toISOString(),
            status: 'active',
            plan: 'lunar'
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            end_date: newDate.toISOString(),
            status: 'active'
          })
          .eq('craftsman_id', subscriptionId);
        if (error) throw error;
      }

      toast.success('Data abonamentului a fost actualizată');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Nu am putut actualiza data abonamentului');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.craftsman_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.craftsman_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizatori Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Numărul total de utilizatori înregistrați
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anunțuri Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              Numărul total de anunțuri postate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonamente Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Numărul de abonamente active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonamente Expirate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiredSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Numărul de abonamente expirate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Managementul Abonamentelor</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gestionează abonamentele meșterilor
          </p>

          <div className="flex items-center mb-6">
            <Search className="w-5 h-5 text-muted-foreground mr-2" />
            <Input
              placeholder="Caută după nume sau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div>Se încarcă...</div>
          ) : (
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
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {subscription.craftsman_name}
                    </TableCell>
                    <TableCell>{subscription.craftsman_email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={subscription.status === "active" ? "default" : "destructive"}
                      >
                        {subscription.status === "active" ? "Activ" : "Inactiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ro-RO') : 'Nesetat'}
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        date={subscription.end_date ? new Date(subscription.end_date) : undefined}
                        setDate={(date) => {
                          if (date) {
                            updateSubscriptionDate(subscription.id, date);
                          }
                        }}
                      >
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Selectează data expirării
                        </Button>
                      </DatePicker>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};
