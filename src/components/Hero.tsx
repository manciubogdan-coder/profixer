
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Hero = () => {
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

  // Mobile and desktop version combined for simplicity and faster rendering
  return (
    <div className="bg-secondary py-8 px-3">
      <div className="container mx-auto text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
          Găsește meșteri pentru
          <span className="text-primary"> orice lucrare</span>
        </h1>
        
        <p className="text-sm md:text-base text-gray-300 mb-4">
          Conectăm clienții cu meșteri verificați
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            onClick={handleSearchClick}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            <Search className="mr-2 h-4 w-4" /> Caută Meșteri
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto"
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
