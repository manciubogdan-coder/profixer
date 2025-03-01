
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing the cookie consent banner to prioritize main content loading
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="text-xs">
          <p>
            Folosim cookie-uri pentru o experiență optimă pe site. 
            Află mai multe în{" "}
            <Link to="/cookies" className="text-primary hover:underline">
              Politica de Cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={declineCookies}>
            Refuz
          </Button>
          <Button size="sm" onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
