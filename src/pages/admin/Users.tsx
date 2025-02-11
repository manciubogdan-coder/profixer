
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
import { UserProfile } from "@/types/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Users = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Eroare la încărcarea utilizatorilor:", error);
      toast.error("Nu am putut încărca lista utilizatorilor");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      
      // Actualizăm starea locală
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as UserProfile["role"] } : user
      ));
      
      toast.success("Rolul utilizatorului a fost actualizat");
      
      // Adăugăm log de audit
      await supabase.from("admin_audit_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: "update_role",
        entity_type: "user",
        entity_id: userId,
        details: { new_role: newRole }
      });
    } catch (error) {
      console.error("Eroare la actualizarea rolului:", error);
      toast.error("Nu am putut actualiza rolul utilizatorului");
    }
  };

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Managementul Utilizatorilor</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nume</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Locație</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => updateUserRole(user.id, value)}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
