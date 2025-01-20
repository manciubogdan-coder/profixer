import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-secondary py-20 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Găsește cel mai bun meșter pentru <br />
          <span className="text-primary">orice lucrare</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Conectăm clienții cu meșteri profesioniști verificați, pentru rezultate garantate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-accent">
            <Search className="mr-2 h-5 w-5" /> Caută Meșteri
          </Button>
          <Button size="lg" variant="outline">
            <ArrowRight className="mr-2 h-5 w-5" /> Devino Meșter
          </Button>
        </div>
      </div>
    </div>
  );
};