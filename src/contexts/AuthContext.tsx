
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
    // Inițializăm sesiunea
    const initSession = async () => {
      try {
        // Verificăm sesiunea curentă
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setLoading(false);
          return;
        }

        // Actualizăm starea cu utilizatorul din sesiune (dacă există)
        setUser(session?.user ?? null);
        
        // Redirecționăm către autentificare dacă nu există sesiune
        if (!session?.user && window.location.pathname !== "/auth") {
          navigate("/auth");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing session:", error);
        setLoading(false);
      }
    };

    initSession();

    // Setăm listener-ul pentru schimbările de autentificare
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        if (window.location.pathname === "/auth") {
          navigate("/");
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate("/auth");
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }

      setLoading(false);
    });

    // Curățăm subscription-ul când componentul este demontat
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
