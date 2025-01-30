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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
          reviews(
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
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
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
              <div className="flex items-start justify-between">
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
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <a href={`tel:${profile?.phone}`}>
                      <Phone className="h-5 w-5" />
                    </a>
                  </Button>
                  {user && user.id !== profile?.id && (
                    <ChatDialog
                      recipientId={profile?.id}
                      recipientName={`${profile?.first_name} ${profile?.last_name}`}
                    >
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
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

          <TabsContent value="reviews" className="space-y-4">
            <ReviewSection craftsman={profile} />
          </TabsContent>

          <TabsContent value="portfolio">
            <p className="text-muted-foreground">Portofoliul va fi disponibil în curând.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CraftsmanPublicProfile;
