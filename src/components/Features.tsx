
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
    <div className="py-16 bg-background">      
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            ABONAMENT GRATUIT MEȘTERI
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Înregistrează-te acum ca meșter și primești acces GRATUIT la toate funcționalitățile platformei până la 1 Iulie 2025
          </p>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-8">
          De ce să alegi ProFixer?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border bg-card"
            >
              <div className="bg-primary p-2 rounded-md w-fit mb-4">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
