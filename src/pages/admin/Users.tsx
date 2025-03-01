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
import { UserProfile, UserRole } from "@/types/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Search, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Users = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("user_profiles_with_email")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!profiles) {
        console.log("No profiles found");
        setUsers([]);
        return;
      }

      const uniqueProfiles = profiles.filter((profile, index, self) =>
        index === self.findIndex((p) => p.id === profile.id)
      );

      setUsers(uniqueProfiles);
    } catch (error) {
      console.error("Eroare la încărcarea utilizatorilor:", error);
      toast.error("Nu am putut încărca lista utilizatorilor");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success("Rolul utilizatorului a fost actualizat");
      
      await supabase.from("admin_audit_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: "update_role",
        entity_type: "user",
        entity_id: userId,
        details: { new_role: newRole }
      });

      await fetchUsers();
    } catch (error) {
      console.error("Eroare la actualizarea rolului:", error);
      toast.error("Nu am putut actualiza rolul utilizatorului");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      console.log(`Starting deletion process for user ${userId}`);
      
      // First check the user's role to handle clients and professionals differently
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        toast.error(`Eroare la verificarea profilului: ${profileError.message}`);
        throw profileError;
      }
      
      const isClient = userProfile.role === 'client';
      console.log(`User is a ${userProfile.role}`);
      
      // First delete the records from tables that have foreign key constraints pointing to profiles
      // For both clients and professionals:

      // Delete notifications first since they reference the user
      console.log("Deleting notifications...");
      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId);
      
      if (notificationsError) {
        console.error("Error deleting notifications:", notificationsError);
        toast.error(`Ștergere notificări eșuată: ${notificationsError.message}`);
      } else {
        console.log("Notifications deleted successfully");
      }

      // Delete messages
      console.log("Deleting messages...");
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      
      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        toast.error(`Ștergere mesaje eșuată: ${messagesError.message}`);
      } else {
        console.log("Messages deleted successfully");
      }
      
      // Delete reviews
      console.log("Deleting reviews...");
      const { error: reviewsError } = await supabase
        .from("reviews")
        .delete()
        .or(`client_id.eq.${userId},craftsman_id.eq.${userId}`);
      
      if (reviewsError) {
        console.error("Error deleting reviews:", reviewsError);
        toast.error(`Ștergere recenzii eșuată: ${reviewsError.message}`);
      } else {
        console.log("Reviews deleted successfully");
      }
      
      // Delete profile interactions
      console.log("Deleting profile interactions...");
      const { error: profileInteractionsError } = await supabase
        .from("profile_interactions")
        .delete()
        .or(`visitor_id.eq.${userId},craftsman_id.eq.${userId}`);
      
      if (profileInteractionsError) {
        console.error("Error deleting profile interactions:", profileInteractionsError);
        toast.error(`Ștergere interacțiuni profil eșuată: ${profileInteractionsError.message}`);
      } else {
        console.log("Profile interactions deleted successfully");
      }
      
      // Delete data specific to clients
      if (isClient) {
        console.log("Deleting job listings for client...");
        const { error: jobListingsError } = await supabase
          .from("job_listings")
          .delete()
          .eq("client_id", userId);
        
        if (jobListingsError) {
          console.error("Error deleting job listings:", jobListingsError);
          toast.error(`Ștergere anunțuri de job eșuată: ${jobListingsError.message}`);
        } else {
          console.log("Job listings deleted successfully");
        }
      } 
      // Delete data specific to professionals
      else {
        console.log("Deleting professional-specific data...");
        
        // Delete payments
        const { error: paymentsError } = await supabase
          .from("payments")
          .delete()
          .eq("craftsman_id", userId);
        
        if (paymentsError) {
          console.error("Error deleting payments:", paymentsError);
          toast.error(`Ștergere plăți eșuată: ${paymentsError.message}`);
        } else {
          console.log("Payments deleted successfully");
        }
        
        // Delete subscriptions
        const { error: subscriptionsError } = await supabase
          .from("subscriptions")
          .delete()
          .eq("craftsman_id", userId);
        
        if (subscriptionsError) {
          console.error("Error deleting subscriptions:", subscriptionsError);
          toast.error(`Ștergere abonamente eșuată: ${subscriptionsError.message}`);
        } else {
          console.log("Subscriptions deleted successfully");
        }
        
        // Delete portfolios and related images
        try {
          console.log("Fetching portfolio IDs...");
          const { data: portfolios, error: portfoliosFetchError } = await supabase
            .from("portfolios")
            .select("id")
            .eq("craftsman_id", userId);
            
          if (portfoliosFetchError) {
            throw portfoliosFetchError;
          }
          
          if (portfolios && portfolios.length > 0) {
            const portfolioIds = portfolios.map(p => p.id);
            
            console.log("Deleting portfolio images...");
            const { error: portfolioImagesError } = await supabase
              .from("portfolio_images")
              .delete()
              .in("portfolio_id", portfolioIds);
              
            if (portfolioImagesError) {
              console.error("Error deleting portfolio images:", portfolioImagesError);
              toast.error(`Ștergere imagini portofoliu eșuată: ${portfolioImagesError.message}`);
            }
          }
          
          console.log("Deleting portfolios...");
          const { error: portfoliosError } = await supabase
            .from("portfolios")
            .delete()
            .eq("craftsman_id", userId);
          
          if (portfoliosError) {
            console.error("Error deleting portfolios:", portfoliosError);
            toast.error(`Ștergere portofolii eșuată: ${portfoliosError.message}`);
          } else {
            console.log("Portfolios deleted successfully");
          }
        } catch (error) {
          console.error("Error in portfolio deletion process:", error);
          toast.error("A apărut o eroare la ștergerea portofoliilor");
        }
        
        // Delete qualifications
        console.log("Deleting qualifications...");
        const { error: qualificationsError } = await supabase
          .from("qualifications")
          .delete()
          .eq("craftsman_id", userId);
        
        if (qualificationsError) {
          console.error("Error deleting qualifications:", qualificationsError);
          toast.error(`Ștergere calificări eșuată: ${qualificationsError.message}`);
        } else {
          console.log("Qualifications deleted successfully");
        }
        
        // Delete specializations
        console.log("Deleting specializations...");
        const { error: specializationsError } = await supabase
          .from("specializations")
          .delete()
          .eq("craftsman_id", userId);
        
        if (specializationsError) {
          console.error("Error deleting specializations:", specializationsError);
          toast.error(`Ștergere specializări eșuată: ${specializationsError.message}`);
        } else {
          console.log("Specializations deleted successfully");
        }
      }
      
      // Delete the profile as the last step before deleting the auth user
      console.log("Deleting user profile...");
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      
      if (profileDeleteError) {
        console.error("Error deleting profile:", profileDeleteError);
        toast.error(`Ștergere profil eșuată: ${profileDeleteError.message}`);
        throw new Error(`Nu s-a putut șterge profilul: ${profileDeleteError.message}`);
      } else {
        console.log("Profile deleted successfully");
      }

      // Try multiple approaches to delete the user from auth system
      console.log("Attempting to delete user from auth system...");
      
      try {
        // Use the admin RPC function we'll create
        console.log("Trying to delete user through RPC function...");
        const { error: rpcError } = await supabase.rpc('delete_user', { user_id: userId });
        
        if (rpcError) {
          console.error("RPC method failed:", rpcError);
          throw rpcError;
        }
        
        console.log("Auth user deleted successfully via RPC function");
      } catch (authError) {
        console.error("Authentication deletion failed:", authError);
        toast.warning("Profilul utilizatorului a fost șters, dar contul de autentificare nu a putut fi șters complet. Un administrator va trebui să șteargă contul manual.");
      }
      
      // Log the successful delete operation
      await supabase.from("admin_audit_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: "delete_user",
        entity_type: "user",
        entity_id: userId,
        details: { 
          cascade_delete: true,
          user_role: userProfile.role 
        }
      });
      
      toast.success("Utilizatorul și toate datele asociate au fost șterse cu succes");
      
      // Update the UI by removing the deleted user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
    } catch (error) {
      console.error("Final error in deletion process:", error);
      toast.error("Procesul de ștergere a eșuat. Verificați consola pentru detalii.");
    } finally {
      setUserToDelete(null);
      setDeleteDialogOpen(false);
      setLoading(false);
    }
  };

  const confirmDelete = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const exportToExcel = () => {
    const exportData = users.map(user => ({
      'Nume': `${user.first_name} ${user.last_name}`,
      'Email': user.email,
      'Rol': user.role,
      'Telefon': user.phone,
      'Locație': `${user.city}, ${user.county}`,
      'Țară': user.country,
      'Adresă': user.address,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  const exportToCSV = () => {
    const exportData = users.map(user => ({
      'Nume': `${user.first_name} ${user.last_name}`,
      'Email': user.email,
      'Rol': user.role,
      'Telefon': user.phone,
      'Locație': `${user.city}, ${user.county}`,
      'Țară': user.country,
      'Adresă': user.address,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "users.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const exportData = users.map(user => [
      `${user.first_name} ${user.last_name}`,
      user.email,
      user.role,
      user.phone,
      `${user.city}, ${user.county}`,
      user.country,
      user.address,
    ]);

    autoTable(doc, {
      head: [['Nume', 'Email', 'Rol', 'Telefon', 'Locație', 'Țară', 'Adresă']],
      body: exportData,
    });

    doc.save('users.pdf');
  };

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Managementul Utilizatorilor</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Mod de ștergere</AlertTitle>
        <AlertDescription>
          Ștergerea unui utilizator va șterge automat toate datele asociate acestuia: mesaje, plăți, abonamente, recenzii, anunțuri, etc.
          Această acțiune este permanentă și nu poate fi anulată.
        </AlertDescription>
      </Alert>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume, email sau telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrează după rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate rolurile</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="professional">Profesionist</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nu există utilizatori care să corespundă criteriilor de căutare.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Locație</TableHead>
              <TableHead>Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selectează rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="professional">Profesionist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  {user.city}, {user.county}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => confirmDelete(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă ștergerea utilizatorului</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <span>
                  Ești sigur că vrei să ștergi utilizatorul <strong>{userToDelete.first_name} {userToDelete.last_name}</strong> ({userToDelete.email})?
                  <br /><br />
                  Această acțiune este ireversibilă și va șterge toate datele asociate acestui utilizator, inclusiv:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Mesaje trimise și primite</li>
                    <li>Plăți și abonamente</li>
                    <li>Recenzii date și primite</li>
                    <li>Portofolii și lucrări</li>
                    <li>Calificări și specializări</li>
                    <li>Anunțuri de job</li>
                    <li>Notificări și interacțiuni</li>
                  </ul>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToDelete && deleteUser(userToDelete.id)}
            >
              Șterge definitiv
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
