
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SubscriptionStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("craftsman_subscription_status")
        .select("*")
        .eq("craftsman_id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching subscription status:", error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  if (!subscriptionStatus) return null;

  if (!subscriptionStatus.is_subscription_active) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Abonament Expirat</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            Abonamentul tău a expirat. Profilul tău nu mai este vizibil pentru clienți și nu mai poți:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Să apari în rezultatele căutării</li>
            <li>Să fii găsit pe hartă</li>
            <li>Să primești mesaje de la clienți noi</li>
            <li>Să primești notificări despre interacțiuni noi</li>
          </ul>
          <Button 
            className="mt-4 w-full sm:w-auto"
            onClick={() => navigate("/subscription/activate")}
          >
            Reactivează Abonamentul
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const endDate = subscriptionStatus.subscription_end_date 
    ? new Date(subscriptionStatus.subscription_end_date)
    : null;
  
  const daysUntilExpiration = endDate 
    ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (daysUntilExpiration <= 7) {
    return (
      <Alert className="mb-4 border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Abonament aproape de expirare</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Abonamentul tău va expira în {daysUntilExpiration} zile. Pentru a evita întreruperea serviciilor,
          te rugăm să reînnoiești abonamentul.
          <Button 
            variant="outline"
            className="mt-4 w-full sm:w-auto border-yellow-600 text-yellow-700 hover:bg-yellow-100"
            onClick={() => navigate("/subscription/activate")}
          >
            Reînnoiește Abonamentul
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-500 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Abonament Activ</AlertTitle>
      <AlertDescription className="text-green-700">
        Abonamentul tău este activ și va expira în {daysUntilExpiration} zile.
      </AlertDescription>
    </Alert>
  );
};
