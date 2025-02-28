
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Testimonials } from "@/components/Testimonials";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarClock, Download, Smartphone, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";

const Index = () => {
  const [showInstructions, setShowInstructions] = useState(false);

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
      
      {/* Logo Download Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Logo ProFixer</h3>
          </div>
          
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-4">
            Descarcă logoul nostru pentru a-l folosi în materialele tale promoționale.
          </p>
          
          <div className="flex justify-center mb-6">
            <img 
              src="/logo-download.png" 
              alt="ProFixer Logo" 
              className="h-24 border border-gray-200 rounded p-2 shadow-sm"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/logo-download.png';
              link.download = 'profixer-logo.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Descarcă Logo PNG
          </Button>
        </div>
      </section>
      
      {/* Mobile App Download Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Smartphone className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Descarcă Aplicația Mobilă</h2>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Ai nevoie de un meșter sau ești un profesionist? Descarcă aplicația 
            ProFixer și bucură-te de toate funcționalitățile direct pe telefonul tău!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              className="w-full sm:w-auto" 
              onClick={() => window.open('/app-debug.apk')}
            >
              <Download className="mr-2" />
              Descarcă pentru Android
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => setShowInstructions(true)}
            >
              <Smartphone className="mr-2" />
              Instrucțiuni de Instalare
            </Button>
          </div>
        </div>
      </section>
      
      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Instrucțiuni de Instalare</DialogTitle>
            <DialogDescription>
              Urmează acești pași pentru a instala aplicația ProFixer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Pentru Android:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Apasă pe butonul "Descarcă pentru Android"</li>
                <li>Când descărcarea se termină, apasă pe fișierul .apk</li>
                <li>Dacă primești avertisment despre "surse necunoscute", mergi în Setări &gt; Securitate &gt; Surse necunoscute și activează opțiunea</li>
                <li>Revino și apasă din nou pe fișierul .apk</li>
                <li>Apasă "Instalează" și așteaptă finalizarea</li>
                <li>Apasă "Deschide" pentru a lansa aplicația</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Pentru iOS:</h3>
              <p className="text-muted-foreground">
                Versiunea pentru iOS va fi disponibilă în curând. Până atunci, 
                poți accesa aplicația prin intermediul browser-ului.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Testimonials />
      <CallToAction />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
