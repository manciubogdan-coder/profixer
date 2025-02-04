import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogOut, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChatDialog } from "./chat/ChatDialog";
import { NotificationsDialog } from "./notifications/NotificationsDialog";

export const Navigation = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Te-ai deconectat cu succes");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("A apărut o eroare la deconectare");
    }
  };

  // Function to check if user is a client
  const isClient = async () => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data?.role === 'client';
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2 mr-8">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
            ProFixer
          </span>
        </Link>

        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/search"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Caută Meșteri
            </Link>
            {user && isClient() && (
              <Link
                to="/jobs/add"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Adaugă Lucrare
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <ChatDialog />
                <NotificationsDialog />
                <Link to="/profile/me">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Conectare</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};