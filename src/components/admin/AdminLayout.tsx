
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Panou Administrare</h1>
        <Outlet />
      </div>
    </div>
  );
};
