
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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Apply optimizations for critical rendering path
  useEffect(() => {
    // Apply content-visibility: auto to defer non-critical elements
    document.querySelectorAll('.defer-render')
      .forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.contentVisibility = 'auto';
        }
      });
    
    // Add loading priority hint
    if (headingRef.current) {
      headingRef.current.setAttribute('fetchpriority', 'high');
    }
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
    <div className="relative bg-secondary py-8 px-4 overflow-hidden">
      {/* Simplificat background pentru a reduce DOM */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(34, 43, 69, 1) 100%)',
          willChange: 'auto'
        }}
      />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Optimizare critică pentru heading */}
          <h1 
            ref={headingRef}
            className="text-4xl md:text-5xl font-bold text-white mb-4 inline-block"
            style={{ 
              willChange: 'auto',
              textRendering: 'optimizeLegibility'
            }}
          >
            Găsește cel mai bun meșter pentru{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              orice lucrare
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto defer-render opacity-90">
            Conectăm clienții cu meșteri profesioniști verificați, pentru rezultate garantate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center defer-render">
            <Button 
              size="default" 
              variant="default"
              className="bg-primary hover:bg-primary/90 transition-colors duration-200"
              onClick={handleSearchClick}
            >
              <Search className="mr-2 h-4 w-4" /> Caută Meșteri
            </Button>
            <Button 
              size="default" 
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors duration-200"
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
