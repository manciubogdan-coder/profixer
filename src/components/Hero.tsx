
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
    <div className="bg-secondary py-12 px-4">
      <div className="container mx-auto text-center">
        <div className="bg-white/5 rounded-2xl p-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
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
              onClick={handleSearchClick}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary"
            >
              <Search className="mr-2 h-4 w-4" /> Caută Meșteri
            </Button>
            <Button 
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20"
              onClick={handleBecomeCraftsmanClick}
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Devino Meșter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

Hero.displayName = "Hero";
