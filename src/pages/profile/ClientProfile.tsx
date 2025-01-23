import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  country: string;
  county: string;
  city: string;
  address: string;
  role: "client" | "professional";
}

const ClientProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for user:", user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            variant: "destructive",
            title: "Eroare",
            description: "Nu am putut încărca profilul. Vă rugăm să încercați din nou.",
          });
          return;
        }

        if (data) {
          console.log("Profile data:", data);
          setProfile({ ...data, email: user.email });
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "A apărut o eroare neașteptată. Vă rugăm să încercați din nou.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, toast]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-[200px]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profilul meu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Informații personale</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nume complet</label>
                  <p className="text-lg">{`${profile?.first_name} ${profile?.last_name}`}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon</label>
                  <p className="text-lg">{profile?.phone}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Adresă</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Țară</label>
                  <p className="text-lg">{profile?.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Județ</label>
                  <p className="text-lg">{profile?.county}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Oraș</label>
                  <p className="text-lg">{profile?.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Adresă</label>
                  <p className="text-lg">{profile?.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline">Editează profilul</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfile;