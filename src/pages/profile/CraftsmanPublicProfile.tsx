import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, MessageCircle, User, Briefcase, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddReviewDialog } from "@/components/reviews/AddReviewDialog";

const CraftsmanPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a vedea profilul");
      navigate("/auth");
    }
  }, [user, navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["craftsman", id],
    queryFn: async () => {
      console.log("Fetching craftsman profile for ID:", id);
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          *,
          reviews!reviews_craftsman_id_fkey(
            id,
            rating,
            comment,
            created_at,
            user:profiles!reviews_client_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
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
          trade:craftsman_type(
            id,
            name
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
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      // Record a profile view for statistics
      if (user && user.id !== id) {
        try {
          await supabase.from("profile_interactions").insert({
            craftsman_id: id,
            visitor_id: user.id,
            interaction_type: "profile_view"
          });
        } catch (e) {
          console.error("Failed to record profile view:", e);
        }
      }

      console.log("Fetched profile:", profile);
      return profile;
    },
    enabled: !!user && !!id,
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8 space-y-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
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
          <p>Profilul nu a fost găsit.</p>
        </div>
      </div>
    );
  }

  const reviews = profile?.reviews || [];
  const specializations = profile?.specializations || [];
  const qualifications = profile?.qualifications || [];
  const portfolios = profile?.portfolios || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {profile?.first_name} {profile?.last_name}
                    </CardTitle>
                    {profile?.trade && (
                      <Badge variant="secondary" className="mt-2">
                        {profile.trade.name}
                      </Badge>
                    )}
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile?.city}, {profile?.county}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    asChild
                  >
                    <a href={`tel:${profile?.phone}`}>
                      <Phone className="h-5 w-5 mr-2" />
                      Sună acum
                    </a>
                  </Button>
                  {user && user.id !== profile?.id && (
                    <ChatDialog
                      recipientId={profile?.id}
                      recipientName={`${profile?.first_name} ${profile?.last_name}`}
                    >
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-2 border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Trimite mesaj
                      </Button>
                    </ChatDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? "recenzie" : "recenzii"})
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="about" className="space-y-4">
          <TabsList>
            <TabsTrigger value="about">Despre</TabsTrigger>
            <TabsTrigger value="reviews">Recenzii</TabsTrigger>
            <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Informații personale</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Adresă</p>
                    <p>{profile.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p>{profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Oraș</p>
                    <p>{profile.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Județ</p>
                    <p>{profile.county}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <CardTitle>Specializări</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {specializations.length === 0 ? (
                  <p className="text-muted-foreground">Nu există specializări adăugate.</p>
                ) : (
                  <div className="space-y-4">
                    {specializations.map((specialization) => (
                      <div key={specialization.id} className="space-y-2">
                        <h4 className="font-medium">{specialization.name}</h4>
                        {specialization.description && (
                          <p className="text-sm text-muted-foreground">
                            {specialization.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <CardTitle>Calificări</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {qualifications.length === 0 ? (
                  <p className="text-muted-foreground">Nu există calificări adăugate.</p>
                ) : (
                  <div className="space-y-4">
                    {qualifications.map((qualification) => (
                      <div key={qualification.id} className="space-y-2">
                        <h4 className="font-medium">{qualification.title}</h4>
                        {qualification.issue_date && (
                          <p className="text-sm text-muted-foreground">
                            Data emiterii: {new Date(qualification.issue_date).toLocaleDateString()}
                          </p>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={qualification.document_url} target="_blank" rel="noopener noreferrer">
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

          <TabsContent value="reviews">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recenzii</CardTitle>
                {user && user.id !== profile.id && (
                  <AddReviewDialog craftsman={profile}>
                    <Button variant="default" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      Adaugă recenzie
                    </Button>
                  </AddReviewDialog>
                )}
              </CardHeader>
              <CardContent>
                <ReviewSection craftsman={profile} />
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
                  <p className="text-muted-foreground">Nu există proiecte în portofoliu încă.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios.map((portfolio) => (
                      <Card key={portfolio.id}>
                        <CardHeader>
                          <CardTitle>{portfolio.title}</CardTitle>
                          {portfolio.description && (
                            <CardDescription>{portfolio.description}</CardDescription>
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
      </div>
    </div>
  );
};

export default CraftsmanPublicProfile;
