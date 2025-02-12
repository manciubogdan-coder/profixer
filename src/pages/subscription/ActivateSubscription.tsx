
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

const ActivateSubscription = () => {
  const { user } = useAuth();

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

  const plans = [
    {
      name: "Lunar",
      price: "99",
      description: "Perfect pentru a începe",
      features: [
        "Toate funcționalitățile incluse",
        "Suport prioritar",
        "Profil verificat",
        "Fără limită de mesaje",
      ],
    },
    {
      name: "Anual",
      price: "990",
      description: "2 luni gratuite",
      features: [
        "Toate funcționalitățile incluse",
        "Suport prioritar",
        "Profil verificat",
        "Fără limită de mesaje",
        "Economisești 198 RON",
      ],
      recommended: true,
    },
  ];

  const handleSubscribe = (planType: "lunar" | "anual") => {
    // TODO: Implementare Stripe
    console.log("Subscribing to", planType, "plan");
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Recomandat
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> RON/lună</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleSubscribe(plan.name.toLowerCase() as "lunar" | "anual")}
                  variant={plan.recommended ? "default" : "outline"}
                >
                  Activează Abonament {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivateSubscription;
