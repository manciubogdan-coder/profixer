
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Only check localStorage once the component is mounted
    if (!localStorage.getItem("cookie-consent")) {
      const timer = setTimeout(() => setShowConsent(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("cookie-consent", accepted ? "accepted" : "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-xs">
          Folosim cookie-uri pentru o experiență optimă pe site. 
          Află mai multe în{" "}
          <Link to="/cookies" className="text-primary hover:underline">
            Politica de Cookies
          </Link>.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleConsent(false)}>
            Refuz
          </Button>
          <Button size="sm" onClick={() => handleConsent(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
