
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ProfileType = {
  id: string;
  first_name: string;
  last_name: string;
  role: "admin" | "client" | "professional";
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  profile: ProfileType | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as ProfileType;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Set up initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) setProfile(userProfile);
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        if (mounted) setProfile(userProfile);
        
        if (window.location.pathname === "/auth") {
          navigate("/");
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
