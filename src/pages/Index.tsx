
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Statistics } from "@/components/Statistics";
import { Testimonials } from "@/components/Testimonials";
import { CallToAction } from "@/components/CallToAction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Users,
  MessageSquare,
  Map,
  Bell,
  Star,
  Phone,
  Clock,
  CheckCircle,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ClientFeatures = () => {
  const features = [
    {
      icon: Clock,
      title: "Economisești Timp",
      description: "Găsește meșterul potrivit în câteva minute, nu zile",
    },
    {
      icon: Shield,
      title: "Meșteri Verificați",
      description: "Toți meșterii sunt verificați și evaluați de comunitatea noastră",
    },
    {
      icon: CheckCircle,
      title: "Calitate Garantată",
      description: "Lucrări executate la standarde înalte de profesioniști",
    },
    {
      icon: ThumbsUp,
      title: "Recenzii Reale",
      description: "Citește experiențele altor clienți și ia decizia potrivită",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            De ce să alegi <span className="text-primary">ProFixer</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Platformă dedicată conectării clienților cu cei mai buni meșteri din România
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-primary/10 hover:border-primary/30 transition-colors">
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
      </div>
    </section>
  );
};

const ProfessionalFeatures = () => {
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

  return (
    <section className="py-16 bg-gray-950">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Devino Meșter Profesionist
          </h2>
          <p className="text-lg text-gray-400">
            Beneficiază de toate funcționalitățile platformei și începe să primești clienți noi chiar astăzi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="text-lg py-6 px-8"
            onClick={() => navigate("/auth")}
          >
            Creează Cont de Meșter
          </Button>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ClientFeatures />
      <Statistics />
      <ProfessionalFeatures />
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default Index;
