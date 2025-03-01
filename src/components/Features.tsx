
import { Clock, Search, Shield } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Găsire Rapidă",
      description: "Găsește meșteri profesioniști în zona ta în câteva minute.",
    },
    {
      icon: Shield,
      title: "Meșteri Verificați",
      description: "Toți meșterii sunt verificați și evaluați de comunitatea noastră.",
    },
    {
      icon: Clock,
      title: "Programare Flexibilă",
      description: "Alege ziua și ora care ți se potrivește pentru lucrarea ta.",
    },
  ];

  return (
    <div className="py-8 bg-background">      
      <div className="container mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1 text-primary">ABONAMENT GRATUIT MEȘTERI</h1>
          <p className="text-sm text-muted-foreground mx-auto">
            Înregistrează-te acum și primești acces gratuit până la 1 Iulie 2025
          </p>
        </div>
        
        <h2 className="text-lg font-bold text-center mb-4">De ce să alegi ProFixer?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-3 rounded-lg border bg-card"
            >
              <div className="bg-primary p-1 rounded-md w-fit mb-2">
                <feature.icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
