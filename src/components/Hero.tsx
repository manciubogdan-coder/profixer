
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

  return (
    <div className="bg-secondary py-6 px-3">
      <div className="container mx-auto text-center">
        <h1 className="text-xl md:text-3xl font-bold text-white mb-2">
          Găsește meșteri pentru
          <span className="text-primary"> orice lucrare</span>
        </h1>
        
        <p className="text-xs md:text-sm text-gray-300 mb-3">
          Conectăm clienții cu meșteri verificați
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            onClick={handleSearchClick}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Search className="mr-2 h-3 w-3" /> Caută Meșteri
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto"
            size="sm"
            onClick={handleBecomeCraftsmanClick}
          >
            <ArrowRight className="mr-2 h-3 w-3" /> Devino Meșter
          </Button>
        </div>
      </div>
    </div>
  );
};

Hero.displayName = "Hero";
