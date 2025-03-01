
import { Clock, Search, Shield, Award } from "lucide-react";

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
    <div className="py-20 bg-background relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary via-background to-background" />
      <div className="absolute -top-40 left-0 right-0 h-80 bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Award className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              ABONAMENT GRATUIT MEȘTERI
            </h1>
            <Award className="h-12 w-12 text-primary ml-4" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Înregistrează-te acum ca meșter și primești acces GRATUIT la toate funcționalitățile platformei până la 1 Iulie 2025
          </p>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-12">
          De ce să alegi{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
            ProFixer
          </span>
          ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 
                        hover:bg-white/10 transition-all duration-300 hover:shadow-2xl 
                        hover:shadow-purple-500/10"
            >
              <div className="bg-gradient-to-br from-primary to-purple-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
