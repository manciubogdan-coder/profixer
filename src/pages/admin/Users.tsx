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
      
      const { error } = await supabase.rpc('delete_user', {
        user_id: userId
      });

      if (error) {
        console.error("Error with RPC function, trying fallback methods:", error);
        
        const isForeignKeyError = error.message?.includes('foreign key constraint');
        if (isForeignKeyError) {
          toast.error("Nu se poate șterge utilizatorul deoarece are date asociate (mesaje, plăți, etc).");
          setLoading(false);
          setUserToDelete(null);
          setDeleteDialogOpen(false);
          return;
        }
        
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        
        if (authError) {
          console.error("Error with Auth API, trying direct database operation:", authError);
          
          const { error: dbError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);
            
          if (dbError) throw dbError;
        }
      }
      
      await supabase.from("admin_audit_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: "delete_user",
        entity_type: "user",
        entity_id: userId,
      });
      
      toast.success("Utilizatorul a fost șters cu succes");
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Eroare la ștergerea utilizatorului:", error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('foreign key constraint')) {
        toast.error("Utilizatorul are date asociate care împiedică ștergerea (mesaje, plăți, etc).");
      } else {
        toast.error("Nu am putut șterge utilizatorul. Verificați consola pentru detalii.");
      }
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
        <AlertTitle>Notă importantă</AlertTitle>
        <AlertDescription>
          Utilizatorii care au mesaje sau plăți asociate nu pot fi șterși. Trebuie să ștergeți mai întâi aceste date.
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
                  Această acțiune este ireversibilă și va șterge toate datele asociate acestui utilizator.
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
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
