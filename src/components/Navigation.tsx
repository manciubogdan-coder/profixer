import { Bell, LogOut, Search, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="bg-secondary py-4 px-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          ProFixer
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/search" className="text-white hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          {user ? (
            <>
              <Link to="/notifications" className="text-white hover:text-primary transition-colors">
                <Bell className="h-5 w-5" />
              </Link>
              <Link to="/profile" className="text-white hover:text-primary transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:text-primary transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};