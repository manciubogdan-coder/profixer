
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPortfolioDialog } from "@/components/profile/AddPortfolioDialog";
import { AddQualificationDialog } from "@/components/profile/AddQualificationDialog";
import { AddSpecializationDialog } from "@/components/profile/AddSpecializationDialog";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

const ClientProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          *,
          trade:craftsman_type(
            id,
            name
          ),
          specializations(
            id,
            name,
            description
          ),
          qualifications(
            id,
            title,
            document_url,
            issue_date
          ),
          portfolios(
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
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return profile;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a vedea profilul");
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">
          <p>Nu am putut găsi profilul.</p>
        </div>
      </div>
    );
  }

  const specializations = profile.specializations || [];
  const qualifications = profile.qualifications || [];
  const portfolios = profile.portfolios || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 space-y-8">
        {/* Adăugăm SubscriptionStatus pentru meșteri */}
        {profile.role === 'professional' && <SubscriptionStatus />}
        
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {profile.first_name} {profile.last_name}
                    </CardTitle>
                    {profile.trade && (
                      <Badge variant="secondary" className="mt-2">
                        {profile.trade.name}
                      </Badge>
                    )}
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {profile.city}, {profile.county}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Anulează" : "Editează"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p>{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresă</p>
                  <p>{profile.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Oraș</p>
                  <p>{profile.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Județ</p>
                  <p>{profile.county}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Țară</p>
                  <p>{profile.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {profile.role === "professional" && (
          <Tabs defaultValue="specializations" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="specializations">Specializări</TabsTrigger>
                <TabsTrigger value="qualifications">Calificări</TabsTrigger>
                <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
              </TabsList>

              {editMode && (
                <div className="flex gap-2">
                  <AddSpecializationDialog />
                  <AddQualificationDialog />
                  <AddPortfolioDialog />
                </div>
              )}
            </div>

            <TabsContent value="specializations">
              <Card>
                <CardHeader>
                  <CardTitle>Specializări</CardTitle>
                </CardHeader>
                <CardContent>
                  {specializations.length === 0 ? (
                    <p className="text-muted-foreground">
                      Nu ai adăugat încă nicio specializare.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {specializations.map((specialization) => (
                        <div
                          key={specialization.id}
                          className="border rounded-lg p-4"
                        >
                          <h4 className="font-medium">
                            {specialization.name}
                          </h4>
                          {specialization.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {specialization.description}
                            </p>
                          )}
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
                    <p className="text-muted-foreground">
                      Nu ai adăugat încă nicio calificare.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {qualifications.map((qualification) => (
                        <div
                          key={qualification.id}
                          className="border rounded-lg p-4"
                        >
                          <h4 className="font-medium">
                            {qualification.title}
                          </h4>
                          {qualification.issue_date && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Data emiterii:{" "}
                              {new Date(qualification.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          <Button
                            variant="link"
                            className="mt-2 p-0"
                            asChild
                          >
                            <a
                              href={qualification.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Vezi document
                            </a>
                          </Button>
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
                    <p className="text-muted-foreground">
                      Nu ai adăugat încă niciun proiect în portofoliu.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolios.map((portfolio) => (
                        <Card key={portfolio.id}>
                          <CardHeader>
                            <CardTitle>{portfolio.title}</CardTitle>
                            {portfolio.description && (
                              <p className="text-sm text-muted-foreground">
                                {portfolio.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent>
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
