import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CallToAction = () => {
  return (
    <div className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/30 rounded-full blur-3xl opacity-20" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center backdrop-blur-sm bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pregătit să găsești{" "}
            <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              meșterul perfect
            </span>
            ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Înscrie-te gratuit și conectează-te cu cei mai buni meșteri din zona ta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary transition-all duration-300"
            >
              Începe Acum
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};