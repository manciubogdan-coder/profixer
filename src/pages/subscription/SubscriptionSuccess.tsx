
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecționare automată după 5 secunde
    const timeout = setTimeout(() => {
      navigate('/profile/me');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Plată Procesată cu Succes!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Abonamentul tău a fost activat cu succes. Vei fi redirecționat automat
              către profilul tău în câteva secunde.
            </p>
            <Button 
              onClick={() => navigate('/profile/me')}
              className="w-full"
            >
              Mergi la Profil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
