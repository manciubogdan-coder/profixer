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
    <div className="py-20 bg-background">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          De ce să alegi <span className="text-primary">ProFixer</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg bg-secondary text-center hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};