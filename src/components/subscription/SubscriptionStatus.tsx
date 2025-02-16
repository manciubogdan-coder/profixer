import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
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
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    data: subscriptionStatus,
    isLoading,
    error
  } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      console.log("Fetching subscription status for user:", user?.id);
      const {
        data,
        error
      } = await supabase.from("craftsman_subscription_status").select("*").eq("craftsman_id", user?.id).single();
      if (error) {
        console.error("Error fetching subscription status:", error);
        return null;
      }
      console.log("Fetched subscription status:", data);
      return data as SubscriptionStatusData;
    },
    enabled: !!user
  });

  // Adăugăm console.log pentru debugging
  console.log("Subscription status:", subscriptionStatus);
  console.log("Loading:", isLoading);
  console.log("Error:", error);
  if (isLoading) {
    return <Alert className="mb-4 bg-gray-50">
        <AlertTitle>Se încarcă statusul abonamentului...</AlertTitle>
      </Alert>;
  }
  if (error || !subscriptionStatus) {
    return <Alert variant="destructive" className="mb-4">
        <AlertTitle>Eroare la încărcarea statusului abonamentului</AlertTitle>
        <AlertDescription>
          Nu am putut încărca informațiile despre abonament. Te rugăm să încerci din nou mai târziu.
        </AlertDescription>
      </Alert>;
  }
  const endDate = subscriptionStatus.subscription_end_date ? new Date(subscriptionStatus.subscription_end_date) : null;
  const daysUntilExpiration = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  if (!subscriptionStatus.is_subscription_active) {
    return <Alert variant="destructive" className="mb-4 bg-[#0F1729] border-red-600">
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

          <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white mt-2" onClick={() => navigate("/subscription/activate")}>
            Reactivează Abonamentul
          </Button>
        </div>
      </Alert>;
  }
  if (daysUntilExpiration <= 7) {
    return <Alert className="mb-4 border-yellow-500 bg-yellow-50">
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
              <Button variant="outline" className="mt-2 w-full sm:w-auto border-yellow-600 text-yellow-700 hover:bg-yellow-100" onClick={() => navigate("/subscription/activate")}>
                Reînnoiește Abonamentul
              </Button>
            </AlertDescription>
          </div>
        </div>
      </Alert>;
  }
  return;
};