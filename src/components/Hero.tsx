
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { memo } from "react";

// Inline SVG instead of Lucide components for initial render
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// Ultra-optimized hero component
export const Hero = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Simplified markup with minimal nesting and classes
  return (
    <div className="relative bg-secondary py-8 px-4 overflow-hidden">
      {/* Plain background color instead of gradient for initial paint */}
      <div className="absolute inset-0 bg-secondary"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Simplified heading with fewer styles */}
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4 inline-block"
            id="main-heading"
          >
            Găsește cel mai bun meșter pentru{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              orice lucrare
            </span>
          </h1>
          
          {/* Load paragraph after heading is visible */}
          <p className="hidden text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto opacity-90">
            Conectăm clienții cu meșteri profesioniști verificați, pentru rezultate garantate.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="default" 
              variant="default"
              className="bg-primary hover:bg-primary/90 transition-colors duration-200"
              onClick={handleSearchClick}
            >
              <span className="mr-2 h-4 w-4"><SearchIcon /></span> Caută Meșteri
            </Button>
            <Button 
              size="default" 
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors duration-200"
              onClick={handleBecomeCraftsmanClick}
            >
              <span className="mr-2 h-4 w-4"><ArrowRightIcon /></span> Devino Meșter
            </Button>
          </div>
        </div>
      </div>

      {/* Script to unhide paragraph after heading is loaded */}
      <script dangerouslySetInnerHTML={{ __html: `
        setTimeout(() => {
          document.querySelectorAll('.hidden').forEach(el => {
            el.classList.remove('hidden');
          });
        }, 100);
      `}} />
    </div>
  );
});

Hero.displayName = "Hero";
