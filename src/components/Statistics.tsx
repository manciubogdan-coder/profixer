import { Users, Star, Clock, CheckCircle } from "lucide-react";

export const Statistics = () => {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Clienți Mulțumiți",
    },
    {
      icon: Star,
      value: "4.8/5",
      label: "Rating Mediu",
    },
    {
      icon: Clock,
      value: "<1 oră",
      label: "Timp de Răspuns",
    },
    {
      icon: CheckCircle,
      value: "100%",
      label: "Meșteri Verificați",
    },
  ];

  return (
    <div className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-background to-background" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 
                         hover:bg-white/10 transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-primary to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};