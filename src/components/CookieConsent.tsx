
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            Folosim cookie-uri pentru a-ți oferi cea mai bună experiență pe site-ul nostru. 
            Poți afla mai multe despre cookie-urile pe care le folosim și cum să le controlezi citind{" "}
            <Link to="/cookies" className="text-primary hover:underline">
              Politica noastră de Cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={declineCookies}>
            Refuz
          </Button>
          <Button onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
