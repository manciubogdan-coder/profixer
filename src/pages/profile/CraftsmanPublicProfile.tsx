import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Statistics } from "@/components/Statistics";
import { ChatDialog } from "@/components/chat/ChatDialog";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  trade?: {
    name: string;
  } | null;
};

type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  client: {
    first_name: string;
    last_name: string;
  } | null;
};

type Portfolio = {
  id: string;
  title: string;
  description: string | null;
  images: { id: string; image_url: string }[];
};

type Specialization = Database["public"]["Tables"]["specializations"]["Row"];

const CraftsmanPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Validate UUID format
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !UUID_REGEX.test(id)) {
      console.error("Invalid UUID format:", id);
      navigate("/profile/me");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for craftsman:", id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            *,
            trade:craftsman_type(name)
          `)
          .eq("id", id)
          .eq("role", "professional")
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        if (!profileData) {
          console.error("No profile found for ID:", id);
          navigate("/profile/me");
          return;
        }

        setProfile(profileData);

        // Fetch related data
        await Promise.all([
          fetchSpecializations(id),
          fetchQualifications(id),
          fetchPortfolios(id),
          fetchReviews(id)
        ]);
      } catch (error) {
        console.error("Error in profile fetch:", error);
        navigate("/profile/me");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const fetchSpecializations = async (craftsmanId: string) => {
    const { data, error } = await supabase
      .from("specializations")
      .select("*")
      .eq("craftsman_id", craftsmanId);

    if (error) {
      console.error("Error fetching specializations:", error);
      return;
    }

    setSpecializations(data || []);
  };

  const fetchQualifications = async (craftsmanId: string) => {
    const { data, error } = await supabase
      .from("qualifications")
      .select("*")
      .eq("craftsman_id", craftsmanId);

    if (error) {
      console.error("Error fetching qualifications:", error);
      return;
    }

    setQualifications(data || []);
  };

  const fetchPortfolios = async (craftsmanId: string) => {
    const { data: portfoliosData, error: portfoliosError } = await supabase
      .from("portfolios")
      .select(`
        id,
        title,
        description,
        portfolio_images (
          id,
          image_url
        )
      `)
      .eq("craftsman_id", craftsmanId);

    if (portfoliosError) {
      console.error("Error fetching portfolios:", portfoliosError);
      return;
    }

    const mappedPortfolios: Portfolio[] = portfoliosData.map(portfolio => ({
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      images: portfolio.portfolio_images
    }));

    setPortfolios(mappedPortfolios);
  };

  const fetchReviews = async (craftsmanId: string) => {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles!reviews_client_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq("craftsman_id", craftsmanId);

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return;
    }

    const mappedReviews: Review[] = reviewsData.map(review => ({
      ...review,
      client: review.profiles ? {
        first_name: review.profiles.first_name,
        last_name: review.profiles.last_name
      } : null
    }));

    setReviews(mappedReviews);
  };

  const handleAddReview = async () => {
    if (!user) {
      toast({
        title: "Trebuie să fii autentificat",
        description: "Pentru a adăuga o recenzie, te rugăm să te autentifici.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          craftsman_id: id,
          client_id: user.id,
          rating,
          comment,
        });

      if (error) throw error;

      toast({
        title: "Recenzie adăugată",
        description: "Recenzia ta a fost adăugată cu succes.",
      });

      setIsReviewDialogOpen(false);
      setRating(5);
      setComment("");
      fetchReviews(id!);
    } catch (error) {
      console.error("Error adding review:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut adăuga recenzia. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-[200px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card>
            <CardHeader className="text-center pb-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.first_name[0]}{profile.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </CardTitle>
                  {profile.trade && (
                    <div className="text-lg text-muted-foreground mt-2">
                      {profile.trade.name}
                    </div>
                  )}
                </div>
                {user && user.id !== profile.id && (
                  <Button 
                    onClick={() => setIsChatOpen(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Trimite mesaj
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="about">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="about">Despre</TabsTrigger>
                  <TabsTrigger value="statistics">Statistici</TabsTrigger>
                  <TabsTrigger value="specializations">Specializări</TabsTrigger>
                  <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
                  <TabsTrigger value="reviews">Recenzii</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact</h3>
                      <div className="space-y-2">
                        <p>Telefon: {profile.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Locație</h3>
                      <div className="space-y-2">
                        <p>{profile.address}</p>
                        <p>{profile.city}, {profile.county}</p>
                        <p>{profile.country}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="statistics">
                  <Statistics />
                </TabsContent>

                <TabsContent value="specializations">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specializations.map((spec) => (
                      <Card key={spec.id}>
                        <CardHeader>
                          <CardTitle>{spec.name}</CardTitle>
                        </CardHeader>
                        {spec.description && (
                          <CardContent>
                            <p>{spec.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="portfolio">
                  <div className="space-y-8">
                    {portfolios.map((portfolio) => (
                      <div key={portfolio.id} className="space-y-4">
                        <h4 className="text-lg font-medium">{portfolio.title}</h4>
                        {portfolio.description && (
                          <p className="text-muted-foreground">{portfolio.description}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {portfolio.images.map((img) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt="Lucrare din portofoliu"
                              className="rounded-lg object-cover w-full h-48"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Recenzii</h3>
                      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>Adaugă recenzie</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adaugă o recenzie</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Rating</Label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <Button
                                    key={value}
                                    variant={rating >= value ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setRating(value)}
                                  >
                                    <Star className={rating >= value ? "fill-primary" : ""} />
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Comentariu</Label>
                              <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Scrie un comentariu..."
                              />
                            </div>
                            <Button onClick={handleAddReview} className="w-full">
                              Adaugă recenzie
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                            ))}
                          </div>
                          <p className="text-lg mb-2">{review.comment}</p>
                          {review.craftsman_response && (
                            <div className="mt-4 pl-4 border-l-2 border-primary">
                              <p className="text-sm text-muted-foreground">Răspuns:</p>
                              <p>{review.craftsman_response}</p>
                            </div>
                          )}
                          <div className="mt-4 text-sm text-muted-foreground">
                            <p>
                              {review.client
                                ? `${review.client.first_name} ${review.client.last_name}`
                                : "Client anonim"}
                            </p>
                            <p>{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {user && user.id !== profile.id && (
        <ChatDialog
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          recipientId={profile.id}
          recipientName={`${profile.first_name} ${profile.last_name}`}
        />
      )}
    </div>
  );
};

export default CraftsmanPublicProfile;
