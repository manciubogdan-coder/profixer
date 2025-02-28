
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  MessageSquare,
  Map,
  Bell,
  Star,
  Phone,
  Loader2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from "sonner";
import { SUBSCRIPTION_PRICES } from "@/lib/subscription";

const ActivateSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Profil Verificat",
      description: "Câștigă încrederea clienților cu un badge de profesionist verificat",
    },
    {
      icon: Users,
      title: "Vizibilitate Maximă",
      description: "Apari în rezultatele căutării și pe hartă pentru toți clienții",
    },
    {
      icon: MessageSquare,
      title: "Comunicare Directă",
      description: "Primești și trimiți mesaje direct către clienți potențiali",
    },
    {
      icon: Map,
      title: "Prezență pe Hartă",
      description: "Fii vizibil pe hartă pentru clienții din zona ta",
    },
    {
      icon: Bell,
      title: "Notificări în Timp Real",
      description: "Primești notificări instant pentru interacțiuni noi",
    },
    {
      icon: Star,
      title: "Recenzii și Rating",
      description: "Primești și afișezi recenzii de la clienții mulțumiți",
    },
    {
      icon: Phone,
      title: "Contact Direct",
      description: "Clienții te pot contacta direct prin telefon",
    },
  ];

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      navigate(`/subscription/checkout?plan=lunar`);
    } catch (error) {
      console.error("Error navigating to checkout:", error);
      toast.error("A apărut o eroare. Vă rugăm încercați din nou.");
      setIsLoading(false);
    }
  };

  // Verificăm dacă suntem înainte de 30 martie 2025
  const isBeforeMarch2025 = new Date() < new Date("2025-03-30T00:00:00Z");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Activează-ți Abonamentul de Meșter Profesionist
          </h1>
          <p className="text-lg text-muted-foreground">
            Deblochează toate funcționalitățile și începe să primești clienți noi chiar astăzi
          </p>
          
          {isBeforeMarch2025 && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Până la 30 martie 2025, toți meșterii noi primesc acces gratuit la toate funcționalitățile platformei!
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-lg mx-auto">
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold">
              {SUBSCRIPTION_PRICES.lunar} RON / lună
            </p>
            <p className="text-muted-foreground">
              Acces complet la toate funcționalitățile platformei
            </p>
          </div>
          
          <Button 
            size="lg"
            className="w-full text-lg py-6"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Se procesează...
              </>
            ) : (
              'Activează Abonament'
            )}
          </Button>

          {isBeforeMarch2025 && (
            <p className="mt-4 text-sm text-center text-muted-foreground">
              Începând cu 30 martie 2025, accesul la platforma ProFixer va fi disponibil doar pe bază de abonament.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateSubscription;
