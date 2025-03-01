
import { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarClock, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Lazy load components that are not needed for initial render
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.Testimonials })));
const CallToAction = lazy(() => import("@/components/CallToAction").then(module => ({ default: module.CallToAction })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(module => ({ default: module.CookieConsent })));

const Index = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownloadAndroid = () => {
    // Link de pe Google Drive pentru descărcare
    const downloadUrl = "https://drive.google.com/file/d/1AJb4iV8V4mpUA3nsVRC3MAEfrf1QSolK/view?usp=drivesdk";
    
    // Deschide link-ul într-o fereastră nouă
    window.open(downloadUrl, "_blank");
    
    toast.success("Redirecționare către pagina de descărcare! Urmează instrucțiunile pentru descărcare și instalare.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Alert className="bg-primary/10 border-primary text-primary">
        <CalendarClock className="h-4 w-4" />
        <AlertDescription className="font-medium">
          Ofertă specială! Înregistrează-te ca meșter și primești GRATUIT un abonament activat până la 1 Iulie 2025.
        </AlertDescription>
      </Alert>
      <Navigation />
      <Hero />
      <Features />
      
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
              onClick={handleDownloadAndroid}
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
                <li>Vei fi redirecționat către Google Drive. Apasă pe butonul de descărcare din partea de sus</li>
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
      
      {/* Lazy loaded components that are not in the initial viewport */}
      <Suspense fallback={<div className="h-40 flex items-center justify-center">Se încarcă...</div>}>
        <Testimonials />
        <CallToAction />
        <Footer />
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
