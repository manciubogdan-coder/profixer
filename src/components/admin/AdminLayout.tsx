
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { Statistics } from "@/components/Statistics";

export const AdminLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Verificăm dacă utilizatorul este admin
  const isAdmin = user?.user_metadata?.role === "admin";
  
  // Verificăm dacă suntem pe pagina de dashboard
  const isDashboard = location.pathname === "/admin" || location.pathname === "/admin/";
  
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
      {isDashboard && <Statistics />}
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};
