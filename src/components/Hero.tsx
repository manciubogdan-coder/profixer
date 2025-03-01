
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

  // Apply priority loading to the critical heading element
  useEffect(() => {
    // Apply content-visibility: auto to defer non-critical elements
    document.querySelectorAll('.defer-render')
      .forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.contentVisibility = 'auto';
        }
      });
    
    // Preload critical fonts used in heading
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'font';
    fontPreload.type = 'font/woff2';
    fontPreload.href = '/fonts/inter-var.woff2';
    fontPreload.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreload);
    
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
    <div className="relative bg-secondary py-12 px-4 overflow-hidden">
      {/* Simplified background with fewer DOM elements */}
      <div className="absolute inset-0 bg-secondary" />
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(76, 29, 149, 0.2) 100%)',
          willChange: 'transform'
        }}
      />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Critical heading with optimized rendering */}
          <h1 
            ref={headingRef}
            className="text-4xl md:text-5xl font-bold text-white mb-4 inline-block"
            style={{ 
              willChange: 'auto',
              transform: 'translateZ(0)', // Force GPU acceleration
              textRendering: 'optimizeSpeed'
            }}
          >
            Găsește cel mai bun meșter pentru{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              orice lucrare
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto defer-render">
            Conectăm clienții cu meșteri profesioniști verificați, pentru rezultate garantate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center defer-render">
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
