import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Statistics } from "@/components/Statistics";
import { Testimonials } from "@/components/Testimonials";
import { CallToAction } from "@/components/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Statistics />
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default Index;