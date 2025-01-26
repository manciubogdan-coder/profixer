import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const CRAFTSMAN_TYPES = {
  carpenter: "Tâmplar",
  plumber: "Instalator",
  electrician: "Electrician",
  painter: "Zugrav",
  mason: "Zidar",
  welder: "Sudor",
  locksmith: "Lăcătuș",
  roofer: "Acoperișar",
  hvac_technician: "Tehnician HVAC",
  general_contractor: "Constructor General"
} as const;

const CraftsmanPublicProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for craftsman:", id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;

        console.log("Profile data:", profileData);
        setProfile(profileData);

        // Fetch specializations
        const { data: specializationsData } = await supabase
          .from("specializations")
          .select("*")
          .eq("craftsman_id", id);
        setSpecializations(specializationsData || []);

        // Fetch qualifications
        const { data: qualificationsData } = await supabase
          .from("qualifications")
          .select("*")
          .eq("craftsman_id", id);
        setQualifications(qualificationsData || []);

        // Fetch portfolios with images
        const { data: portfoliosData } = await supabase
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
          .eq("craftsman_id", id);
        setPortfolios(portfoliosData || []);

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select(`
            *,
            profiles!reviews_client_id_fkey (
              first_name,
              last_name
            )
          `)
          .eq("craftsman_id", id);
        setReviews(reviewsData || []);

      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Nu am putut încărca profilul. Vă rugăm să încercați din nou.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Trebuie să fiți autentificat pentru a lăsa o recenzie");
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

      toast.success("Recenzia a fost adăugată cu succes");
      setIsReviewDialogOpen(false);
      setRating(0);
      setComment("");

      // Refresh reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles!reviews_client_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("craftsman_id", id);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Nu am putut adăuga recenzia. Vă rugăm să încercați din nou.");
    }
  };

  if (isLoading) {
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

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Profilul nu a fost găsit
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card className="bg-white/5 backdrop-blur-lg border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {profile.first_name} {profile.last_name}
                  </CardTitle>
                  {profile.craftsman_type && (
                    <div className="text-lg text-muted-foreground mt-2">
                      {CRAFTSMAN_TYPES[profile.craftsman_type]}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(averageRating)
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">
                      ({reviews.length} recenzii)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">Despre</TabsTrigger>
                  <TabsTrigger value="specializations">Specializări</TabsTrigger>
                  <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
                  <TabsTrigger value="reviews">Recenzii</TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-primary">Contact</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Telefon</Label>
                          <p className="text-lg font-medium mt-1">{profile.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-primary">Locație</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Oraș</Label>
                          <p className="text-lg font-medium mt-1">{profile.city}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Județ</Label>
                          <p className="text-lg font-medium mt-1">{profile.county}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specializations">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Specializări</h3>
                    {specializations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specializations.map((spec: any) => (
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
                    ) : (
                      <p className="text-muted-foreground">Nu există specializări adăugate.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="portfolio">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Portofoliu</h3>
                    {portfolios.length > 0 ? (
                      <div className="space-y-8">
                        {portfolios.map((portfolio: any) => (
                          <div key={portfolio.id} className="space-y-4">
                            <h4 className="text-lg font-medium">{portfolio.title}</h4>
                            {portfolio.description && (
                              <p className="text-muted-foreground">{portfolio.description}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {portfolio.portfolio_images.map((img: any) => (
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
                    ) : (
                      <p className="text-muted-foreground">Nu există lucrări în portofoliu.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Recenzii</h3>
                      {user && user.id !== id && (
                        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>Adaugă recenzie</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adaugă o recenzie</DialogTitle>
                              <DialogDescription>
                                Împărtășește experiența ta cu acest meșter
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Rating</Label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <Button
                                      key={value}
                                      variant={rating === value ? "default" : "outline"}
                                      size="icon"
                                      onClick={() => setRating(value)}
                                    >
                                      <Star className={`w-4 h-4 ${
                                        rating >= value ? "fill-primary" : ""
                                      }`} />
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Comentariu</Label>
                                <Textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Scrie un comentariu despre experiența ta..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleSubmitReview}
                                disabled={!rating || !comment}
                              >
                                Trimite recenzia
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    {reviews.length > 0 ? (
                      <div className="grid gap-4">
                        {reviews.map((review: any) => (
                          <Card key={review.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-center gap-2 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < review.rating
                                        ? "fill-primary text-primary"
                                        : "fill-muted text-muted"
                                    }`}
                                  />
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
                                  {review.profiles
                                    ? `${review.profiles.first_name} ${review.profiles.last_name}`
                                    : "Client anonim"}
                                </p>
                                <p>{new Date(review.created_at).toLocaleDateString()}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nu există recenzii încă.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CraftsmanPublicProfile;