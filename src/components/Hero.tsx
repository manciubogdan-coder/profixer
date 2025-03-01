
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

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

  // Super simplified component with minimal styling
  if (isMobile) {
    return (
      <div className="py-8 px-3 bg-secondary">
        <h1 className="text-2xl font-bold text-white mb-3">
          Găsește meșteri pentru
          <span className="text-primary"> orice lucrare</span>
        </h1>
        
        <p className="text-sm text-gray-300 mb-4">
          Conectăm clienții cu meșteri verificați
        </p>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleSearchClick}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Search className="mr-2 h-4 w-4" /> Caută Meșteri
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={handleBecomeCraftsmanClick}
          >
            <ArrowRight className="mr-2 h-4 w-4" /> Devino Meșter
          </Button>
        </div>
      </div>
    );
  }

  // Desktop version - still optimized but with slightly better styling
  return (
    <div className="bg-secondary py-10 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Găsește cel mai bun meșter pentru <br />
          <span className="text-primary">orice lucrare</span>
        </h1>
        
        <p className="text-base text-gray-300 mb-6 max-w-xl mx-auto">
          Conectăm clienții cu meșteri profesioniști verificați
        </p>
        
        <div className="flex flex-row gap-3 justify-center">
          <Button 
            onClick={handleSearchClick}
            className="bg-primary hover:bg-primary/90"
          >
            <Search className="mr-2 h-4 w-4" /> Caută Meșteri
          </Button>
          <Button 
            variant="outline"
            onClick={handleBecomeCraftsmanClick}
          >
            <ArrowRight className="mr-2 h-4 w-4" /> Devino Meșter
          </Button>
        </div>
      </div>
    </div>
  );
};

Hero.displayName = "Hero";
