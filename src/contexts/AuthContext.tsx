
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
    console.log("Fetching profile for user ID:", userId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Could not load profile data");
        return null;
      }

      console.log("Profile data retrieved:", data);
      return data as ProfileType;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      toast.error("Error loading profile data");
      return null;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate("/auth");
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("Auth context initialized");
    
    // Set up initial session
    const initializeAuth = async () => {
      try {
        console.log("Getting initial session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) setLoading(false);
          return;
        }
        
        console.log("Session retrieved:", session ? "Valid session" : "No session");
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log("User found in session:", session.user.email);
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            console.log("Setting profile after session check:", userProfile);
            setProfile(userProfile);
          }
        } else {
          console.log("No user in session");
        }
        
        if (mounted) {
          console.log("Setting loading to false");
          setLoading(false);
        }
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
        console.log("Setting user after auth change:", session.user.email);
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        if (mounted) {
          console.log("Setting profile after auth change:", userProfile);
          setProfile(userProfile);
        }
        
        if (window.location.pathname === "/auth") {
          console.log("Redirecting to home after auth");
          navigate("/");
        }
      } else {
        console.log("Clearing user and profile after auth change");
        setUser(null);
        setProfile(null);
      }
      
      if (mounted) {
        console.log("Setting loading to false after auth change");
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth context");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Debug log whenever important state changes
  useEffect(() => {
    console.log("Auth state updated - User:", user?.email, "Profile:", profile?.first_name, "Loading:", loading);
  }, [user, profile, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
