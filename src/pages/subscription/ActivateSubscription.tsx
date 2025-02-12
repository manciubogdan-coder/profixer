
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  ChevronRight,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ActivateSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleSubscribe = () => {
    navigate(`/subscription/checkout?plan=lunar`);
  };

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
          <Card className="relative border-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                Abonament Lunar
              </CardTitle>
              <CardDescription>
                Acces la toate funcționalitățile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">99</span>
                <span className="text-muted-foreground"> RON/lună</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Toate funcționalitățile incluse</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Suport prioritar</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Profil verificat</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span>Fără limită de mesaje</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleSubscribe}
              >
                Activează Abonament
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivateSubscription;
