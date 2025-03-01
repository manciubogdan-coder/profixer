
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { memo, useEffect, useRef } from "react";

// Memoized hero component to prevent unnecessary re-rendering
export const Hero = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);

  // Optimizare pentru încărcare - preload resources
  useEffect(() => {
    // Prioritizare încărcare
    if (heroRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              heroRef.current?.classList.add('loaded');
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(heroRef.current);
      
      // Cleanup function
      return () => {
        observer.disconnect();
      };
    }

    // Preload gradient backgrounds
    const preloadBg = new Image();
    preloadBg.fetchPriority = 'high';
    preloadBg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxZTI5M2IiLz48L3N2Zz4=';
    
  }, []);

  const handleSearchClick = () => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a căuta meșteri");
      navigate("/auth");
      return;
    }
    navigate("/search");
  };

  const handleBecomeCraftsmanClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/profile/me");
  };

  return (
    <div 
      ref={heroRef}
      className="relative bg-secondary py-12 px-4 overflow-hidden will-change-transform"
      style={{ 
        contentVisibility: 'auto',
        containIntrinsicSize: '0 500px' 
      }}
    >
      {/* Optimizare background - folosirea CSS simplificat și versiunea inline pentru gradienți */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-secondary to-secondary" />
      
      {/* Efect blur optimizat cu CSS simplificat */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" 
           style={{ transform: 'translateZ(0)' }} /> {/* Hardware acceleration */}
      
      <div className="container mx-auto text-center relative z-10">
        <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 max-w-4xl mx-auto shadow-xl">
          {/* Heading optimizat cu text rendering optimizat */}
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ 
              willChange: 'transform', 
              textRendering: 'optimizeSpeed',
              transform: 'translateZ(0)'
            }}
          >
            Găsește cel mai bun meșter pentru <br />
            <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              orice lucrare
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Conectăm clienții cu meșteri profesioniști verificați, pentru rezultate garantate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="default" 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary transition-all duration-300"
              onClick={handleSearchClick}
            >
              <Search className="mr-2 h-4 w-4" /> Caută Meșteri
            </Button>
            <Button 
              size="default" 
              variant="outline"
              className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300"
              onClick={handleBecomeCraftsmanClick}
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Devino Meșter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

Hero.displayName = "Hero";
