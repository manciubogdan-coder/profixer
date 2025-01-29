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
    <div className="relative bg-secondary py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-secondary to-secondary" />
      
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Găsește cel mai bun meșter pentru <br />
            <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              orice lucrare
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conectăm clienții cu meșteri profesioniști verificați, pentru rezultate garantate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary transition-all duration-300"
              onClick={handleSearchClick}
            >
              <Search className="mr-2 h-5 w-5" /> Caută Meșteri
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300"
              onClick={handleBecomeCraftsmanClick}
            >
              <ArrowRight className="mr-2 h-5 w-5" /> Devino Meșter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};