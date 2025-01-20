import { Star } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Alexandru Popescu",
      role: "Proprietar Casă",
      content: "Am găsit un electrician excelent în mai puțin de o oră. Serviciu extraordinar!",
      rating: 5,
    },
    {
      name: "Maria Ionescu",
      role: "Manager Restaurant",
      content: "ProFixer ne-a ajutat să găsim rapid un instalator pentru urgența noastră. Recomand cu încredere!",
      rating: 5,
    },
    {
      name: "Ioan Dumitrescu",
      role: "Administrator Bloc",
      content: "Platforma perfectă pentru găsirea meșterilor profesioniști. Economisești timp și bani.",
      rating: 5,
    },
  ];

  return (
    <div className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background" />
      
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4">
          Ce Spun{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
            Clienții Noștri
          </span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Descoperă experiențele reale ale clienților care au folosit platforma noastră pentru a găsi meșteri profesioniști
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-white/90 mb-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};