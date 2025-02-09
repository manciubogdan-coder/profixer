
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // If we're on the auth page and have a valid session, redirect to home
          if (window.location.pathname === "/auth") {
            navigate("/");
          }
        } else {
          setUser(null);
          // Only redirect to auth if we're not already there
          if (window.location.pathname !== "/auth") {
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        setUser(null);
        toast.error("A apărut o eroare la verificarea sesiunii");
        if (window.location.pathname !== "/auth") {
          navigate("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (session?.user) {
        setUser(session.user);
        if (window.location.pathname === "/auth") {
          navigate("/");
        }
      } else {
        setUser(null);
        if (window.location.pathname !== "/auth") {
          navigate("/auth");
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
