
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

  // Function to check and activate subscription for professional users
  const activateSubscriptionIfNeeded = async (userId: string) => {
    try {
      // First check if the user is a professional
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
      
      if (profile.role !== 'professional') {
        // No need to activate subscription for non-professionals
        return;
      }
      
      // Get current subscription status
      const { data: subscriptionStatus, error: statusError } = await supabase
        .from('craftsman_subscription_status_latest')
        .select('*')
        .eq('craftsman_id', userId)
        .maybeSingle();
      
      console.log('Current subscription status:', subscriptionStatus);
      
      // If already active with a future end date, don't update
      const targetEndDate = new Date('2025-07-01T23:59:59');
      if (subscriptionStatus?.is_subscription_active && 
          subscriptionStatus?.subscription_end_date && 
          new Date(subscriptionStatus.subscription_end_date) >= targetEndDate) {
        console.log('Subscription already active with sufficient end date');
        return;
      }
      
      // Activate subscription until July 1, 2025
      console.log('Activating subscription until July 1, 2025');
      const { error: updateError } = await supabase
        .rpc('update_craftsman_subscription_status', {
          p_craftsman_id: userId,
          p_is_active: true,
          p_end_date: targetEndDate.toISOString()
        });
      
      if (updateError) {
        console.error('Error activating subscription:', updateError);
        return;
      }
      
      console.log('Subscription successfully activated until July 1, 2025');
    } catch (error) {
      console.error('Error in subscription activation:', error);
    }
  };

  useEffect(() => {
    // Set up initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Activate subscription for the user if they're a professional
        activateSubscriptionIfNeeded(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (session?.user) {
        setUser(session.user);
        
        // When a user signs in or signs up, activate their subscription if needed
        if (event === 'SIGNED_IN') {
          activateSubscriptionIfNeeded(session.user.id);
        }
        
        if (window.location.pathname === "/auth") {
          navigate("/");
        }
      } else {
        setUser(null);
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
