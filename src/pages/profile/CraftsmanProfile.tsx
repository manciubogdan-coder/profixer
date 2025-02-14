
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';

const CraftsmanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProfessional } = useSubscriptionCheck();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["craftsman", id],
    queryFn: async () => {
      // Folosim view-ul user_profiles_with_email pentru a include și email-ul
      const { data: profile, error } = await supabase
        .from("user_profiles_with_email")
        .select(`
          *,
          specializations!specializations_craftsman_id_fkey(
            id,
            name,
            description
          ),
          qualifications!qualifications_craftsman_id_fkey(
            id,
            title,
            document_url,
            issue_date
          ),
          portfolios!portfolios_craftsman_id_fkey(
            id,
            title,
            description,
            created_at,
            portfolio_images(
              id,
              image_url
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return profile;
    },
    enabled: !!user && !!id,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <p>Profilul nu a fost găsit.</p>
        </div>
      </div>
    );
  }

  const specializations = profile?.specializations || [];
  const qualifications = profile?.qualifications || [];
  const portfolios = profile?.portfolios || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 space-y-8">
        {/* Adăugăm SubscriptionStatus doar pentru profilul propriu al meșterului */}
        {user?.id === profile?.id && profile.role === 'professional' && (
          <SubscriptionStatus />
        )}

        {/* Informații de bază */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.first_name} {profile.last_name}</CardTitle>
                <p className="text-muted-foreground">{profile.city}, {profile.county}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Adresă</p>
              <p className="text-sm text-muted-foreground">{profile.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Telefon</p>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tab-uri pentru specializări, calificări și portofoliu */}
        <Tabs defaultValue="specializations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="specializations">Specializări</TabsTrigger>
            <TabsTrigger value="qualifications">Calificări</TabsTrigger>
            <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
          </TabsList>

          <TabsContent value="specializations">
            <Card>
              <CardHeader>
                <CardTitle>Specializări</CardTitle>
              </CardHeader>
              <CardContent>
                {specializations.length === 0 ? (
                  <p className="text-muted-foreground">Nu ai adăugat încă nicio specializare.</p>
                ) : (
                  <div className="space-y-4">
                    {specializations.map((spec) => (
                      <div key={spec.id} className="space-y-2">
                        <h4 className="font-medium">{spec.name}</h4>
                        <p className="text-sm text-muted-foreground">{spec.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualifications">
            <Card>
              <CardHeader>
                <CardTitle>Calificări</CardTitle>
              </CardHeader>
              <CardContent>
                {qualifications.length === 0 ? (
                  <p className="text-muted-foreground">Nu ai adăugat încă nicio calificare.</p>
                ) : (
                  <div className="space-y-4">
                    {qualifications.map((qual) => (
                      <div key={qual.id} className="space-y-2">
                        <h4 className="font-medium">{qual.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Data emiterii: {new Date(qual.issue_date).toLocaleDateString()}
                        </p>
                        {qual.document_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={qual.document_url} target="_blank" rel="noopener noreferrer">
                              Vezi document
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portofoliu</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolios.length === 0 ? (
                  <p className="text-muted-foreground">Nu ai adăugat încă niciun proiect în portofoliu.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolios.map((portfolio) => (
                      <div key={portfolio.id} className="space-y-2">
                        <h4 className="font-medium">{portfolio.title}</h4>
                        <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {portfolio.portfolio_images?.map((image) => (
                            <img
                              key={image.id}
                              src={image.image_url}
                              alt={portfolio.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CraftsmanProfile;
