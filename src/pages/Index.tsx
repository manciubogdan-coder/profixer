
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Testimonials } from "@/components/Testimonials";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarClock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Alert className="bg-primary/10 border-primary text-primary">
        <CalendarClock className="h-4 w-4" />
        <AlertDescription className="font-medium">
          Ofertă specială! Înregistrează-te ca meșter și primești GRATUIT un abonament activat până la 30 Martie 2025.
        </AlertDescription>
      </Alert>
      <Navigation />
      <Hero />
      <Features />
      <Testimonials />
      <CallToAction />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
