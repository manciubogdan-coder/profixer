import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Statistics } from "@/components/Statistics";
import { Testimonials } from "@/components/Testimonials";
import { CallToAction } from "@/components/CallToAction";

export default function Index() {
  return (
    <main>
      <Hero />
      <Features />
      <Statistics />
      <Testimonials />
      <CallToAction />
    </main>
  );
}