
import { lazy, Suspense, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarClock, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Lazy load all non-critical components with proper type handling
const CookieConsent = lazy(() => import("@/components/CookieConsent").then(module => ({ default: module.CookieConsent })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(module => ({ default: module.Testimonials })));
const CallToAction = lazy(() => import("@/components/CallToAction").then(module => ({ default: module.CallToAction })));

const Index = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownloadAndroid = () => {
    const downloadUrl = "https://drive.google.com/file/d/1AJb4iV8V4mpUA3nsVRC3MAEfrf1QSolK/view?usp=drivesdk";
    window.open(downloadUrl, "_blank");
    toast.success("Redirecționare către pagina de descărcare! Urmează instrucțiunile pentru descărcare și instalare.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Alert className="bg-primary/10 border-primary text-primary">
        <CalendarClock className="h-4 w-4" />
        <AlertDescription className="text-xs font-medium">
          Ofertă specială! Înregistrează-te ca meșter și primești GRATUIT un abonament activat până la 1 Iulie 2025.
        </AlertDescription>
      </Alert>
      <Navigation />
      <Hero />
      <Features />
      
      <section className="py-8 bg-secondary/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Descarcă Aplicația Mobilă</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mx-auto mb-4">
            Ai nevoie de un meșter sau ești un profesionist? Descarcă aplicația 
            ProFixer pe telefonul tău!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Button 
              size="sm" 
              className="w-full sm:w-auto" 
              onClick={handleDownloadAndroid}
            >
              <Download className="mr-2 h-4 w-4" />
              Descarcă pentru Android
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => setShowInstructions(true)}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Instrucțiuni
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
          
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Pentru Android:</h3>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>Apasă pe butonul "Descarcă pentru Android"</li>
                <li>Vei fi redirecționat către Google Drive. Apasă pe butonul de descărcare</li>
                <li>Când descărcarea se termină, apasă pe fișierul .apk</li>
                <li>Dacă primești avertisment despre "surse necunoscute", mergi în Setări &gt; Securitate &gt; Surse necunoscute și activează opțiunea</li>
                <li>Revino și apasă din nou pe fișierul .apk</li>
                <li>Apasă "Instalează" și așteaptă finalizarea</li>
                <li>Apasă "Deschide" pentru a lansa aplicația</li>
              </ol>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Pentru iOS:</h3>
              <p className="text-xs text-muted-foreground">
                Versiunea pentru iOS va fi disponibilă în curând. Până atunci, 
                poți accesa aplicația prin intermediul browser-ului.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Optimized lazy loading with minimal fallback */}
      <Suspense fallback={<div aria-hidden="true" className="h-4" />}>
        <Testimonials />
        <CallToAction />
        <Footer />
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
