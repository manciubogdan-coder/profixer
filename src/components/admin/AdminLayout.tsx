
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { Statistics } from "@/components/Statistics";

export const AdminLayout = () => {
  const { user, loading } = useAuth();
  
  // Verificăm dacă utilizatorul este admin
  const isAdmin = user?.user_metadata?.role === "admin";
  
  if (loading) {
    return <div>Se încarcă...</div>;
  }
  
  // Redirectăm utilizatorii non-admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <Statistics />
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};
