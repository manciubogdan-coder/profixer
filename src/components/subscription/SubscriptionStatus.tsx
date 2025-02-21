
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface SubscriptionStatusData {
  craftsman_id: string;
  subscription_status: 'active' | 'inactive';
  subscription_end_date: string | null;
  is_subscription_active: boolean;
}

export const SubscriptionStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log("SubscriptionStatus Component - User ID:", user?.id);

  // Verificăm rolul utilizatorului
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const {
    data: subscriptionStatus,
    isLoading,
    error
  } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      console.log("Fetching subscription status for user:", user?.id);
      const { data, error } = await supabase
        .from("craftsman_subscription_status")
        .select("*")
        .eq("craftsman_id", user?.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription status:", error);
        throw error;
      }

      console.log("Fetched subscription status:", data);
      return data as SubscriptionStatusData;
    },
    enabled: !!user?.id && profile?.role === 'professional',
    refetchInterval: 30000 // Reîmprospătăm datele la fiecare 30 secunde
  });

  const refreshSubscriptionStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-status', user?.id] });
  };

  console.log("Profile role:", profile?.role);
  console.log("Subscription status:", subscriptionStatus);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  // Nu afișăm nimic dacă utilizatorul nu este profesionist
  if (!profile || profile.role !== 'professional') {
    return null;
  }

  if (isLoading) {
    return (
      <Alert className="mb-4 bg-gray-50">
        <AlertTitle>Se încarcă statusul abonamentului...</AlertTitle>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Eroare la încărcarea statusului abonamentului</AlertTitle>
        <AlertDescription>
          Nu am putut încărca informațiile despre abonament. Te rugăm să încerci din nou mai târziu.
        </AlertDescription>
      </Alert>
    );
  }

  // Dacă nu există date despre abonament, înseamnă că utilizatorul nu are unul
  if (!subscriptionStatus) {
    return (
      <Alert variant="destructive" className="mb-4 bg-[#0F1729] border-red-600">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <AlertTitle className="text-lg font-semibold text-white">Fără Abonament Activ</AlertTitle>
              <AlertDescription className="mt-2 text-gray-300">
                Nu ai un abonament activ. Activează un abonament pentru a beneficia de toate funcționalitățile platformei.
              </AlertDescription>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white mb-2 font-medium">Nu ai acces la:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
              <li>Vizibilitate în rezultatele căutării</li>
              <li>Prezență pe hartă</li>
              <li>Mesaje de la clienți noi</li>
              <li>Notificări despre interacțiuni</li>
            </ul>
          </div>

          <Button 
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white mt-2" 
            onClick={() => {
              navigate("/subscription/activate");
              refreshSubscriptionStatus();
            }}
          >
            Activează Abonamentul
          </Button>
        </div>
      </Alert>
    );
  }

  const endDate = subscriptionStatus.subscription_end_date ? new Date(subscriptionStatus.subscription_end_date) : null;
  const daysUntilExpiration = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (!subscriptionStatus.is_subscription_active) {
    return (
      <Alert variant="destructive" className="mb-4 bg-[#0F1729] border-red-600">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <AlertTitle className="text-lg font-semibold text-white">Abonament Expirat</AlertTitle>
              <AlertDescription className="mt-2 text-gray-300">
                Abonamentul tău a expirat la data de {endDate ? format(endDate, 'd MMMM yyyy', {
                  locale: ro
                }) : 'N/A'}.
                Profilul tău nu mai este vizibil pentru clienți și ai acces limitat la platformă.
              </AlertDescription>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white mb-2 font-medium">Nu mai ai acces la:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
              <li>Vizibilitate în rezultatele căutării</li>
              <li>Prezență pe hartă</li>
              <li>Mesaje de la clienți noi</li>
              <li>Notificări despre interacțiuni</li>
            </ul>
          </div>

          <Button 
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white mt-2" 
            onClick={() => {
              navigate("/subscription/activate");
              refreshSubscriptionStatus();
            }}
          >
            Reactivează Abonamentul
          </Button>
        </div>
      </Alert>
    );
  }

  if (daysUntilExpiration <= 7) {
    return (
      <Alert className="mb-4 border-yellow-500 bg-yellow-50">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="ml-3 flex-1">
            <AlertTitle className="text-yellow-800 text-lg font-semibold">
              Abonament aproape de expirare
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="text-yellow-700">
                Abonamentul tău va expira în {daysUntilExpiration} zile, 
                pe data de {endDate ? format(endDate, 'd MMMM yyyy', {
                  locale: ro
                }) : 'N/A'}.
              </p>
              <p className="text-yellow-700">
                Pentru a evita întreruperea serviciilor, te rugăm să reînnoiești abonamentul.
              </p>
              <Button 
                variant="outline" 
                className="mt-2 w-full sm:w-auto border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                onClick={() => {
                  navigate("/subscription/activate");
                  refreshSubscriptionStatus();
                }}
              >
                Reînnoiește Abonamentul
              </Button>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  // Pentru abonament activ și valid (mai mult de 7 zile până la expirare)
  return (
    <Alert className="mb-4 border-green-500 bg-green-50">
      <div className="flex items-start">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <AlertTitle className="text-green-800 text-lg font-semibold">
            Abonament Activ
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-green-700">
              Abonamentul tău este activ și va expira pe data de{' '}
              {endDate ? format(endDate, 'd MMMM yyyy', {
                locale: ro
              }) : 'N/A'}.
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
