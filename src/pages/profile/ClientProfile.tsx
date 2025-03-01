import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddSpecializationDialog } from "@/components/profile/AddSpecializationDialog";
import { AddQualificationDialog } from "@/components/profile/AddQualificationDialog";
import { AddPortfolioDialog } from "@/components/profile/AddPortfolioDialog";
import { EditPortfolioDialog } from "@/components/profile/EditPortfolioDialog";
import { Database } from "@/integrations/supabase/types";
import { Star } from "lucide-react";
import { Pencil, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { MessageSquare } from "lucide-react";
import { CraftsmanStats } from "@/components/profile/CraftsmanStats";

type UserRole = Database["public"]["Enums"]["user_role"];
type CraftsmanType = Database["public"]["Enums"]["craftsman_type"];

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
  role: Database["public"]["Enums"]["user_role"];
  avatar_url?: string | null;
  craftsman_type?: string | null; // Changed to string | null to match the UUID from trades table
  trade?: {
    id: string;
    name: string;
  } | null;
}

interface Specialization {
  id: string;
  name: string;
  description: string | null;
}

interface Qualification {
  id: string;
  title: string;
  document_url: string;
  issue_date: string | null;
}

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  images: { id: string; image_url: string }[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  craftsman_response: string | null;
  created_at: string;
  client: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Trade {
  id: string;
  name: string;
  description: string | null;
}

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

const ClientProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isEditPortfolioOpen, setIsEditPortfolioOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for user:", user.id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            *,
            trade:craftsman_type(
              id,
              name
            )
          `)
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Nu am putut încărca profilul. Vă rugăm să încercați din nou.");
          return;
        }

        if (profileData) {
          console.log("Profile data:", profileData);
          const profileWithEmail = { ...profileData, email: user.email };
          setProfile(profileWithEmail);
          setEditedProfile(profileWithEmail);

          if (profileData.role === "professional") {
            await Promise.all([
              fetchSpecializations(user.id),
              fetchQualifications(user.id),
              fetchPortfolios(user.id),
              fetchReviews(user.id),
              fetchTrades()
            ]);
          }
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
        toast.error("A apărut o eroare neașteptată. Vă rugăm să încercați din nou.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*');

    if (error) {
      console.error("Error fetching trades:", error);
      return;
    }

    setTrades(data || []);
  };

  const fetchSpecializations = async (userId: string) => {
    const { data, error } = await supabase
      .from("specializations")
      .select("*")
      .eq("craftsman_id", userId);

    if (error) {
      console.error("Error fetching specializations:", error);
      return;
    }

    setSpecializations(data || []);
  };

  const fetchQualifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("qualifications")
      .select("*")
      .eq("craftsman_id", userId);

    if (error) {
      console.error("Error fetching qualifications:", error);
      return;
    }

    setQualifications(data || []);
  };

  const fetchPortfolios = async (userId: string) => {
    console.log("Fetching portfolios for user:", userId);
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
      .eq("craftsman_id", userId)
      .order('created_at', { ascending: false });

    if (portfoliosError) {
      console.error("Error fetching portfolios:", portfoliosError);
      return;
    }

    console.log("Portfolios data:", portfoliosData);
    
    const mappedPortfolios: Portfolio[] = portfoliosData.map(portfolio => ({
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      images: portfolio.portfolio_images.map(img => ({
        id: img.id,
        image_url: img.image_url
      }))
    }));

    setPortfolios(mappedPortfolios);
  };

  const fetchReviews = async (userId: string) => {
    console.log("Fetching reviews for user:", userId);
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        craftsman_response,
        created_at,
        profiles!reviews_client_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq("craftsman_id", userId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      return;
    }

    console.log("Reviews data:", reviewsData);

    const mappedReviews: Review[] = reviewsData.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      craftsman_response: review.craftsman_response,
      created_at: review.created_at,
      client: review.profiles ? {
        first_name: review.profiles.first_name,
        last_name: review.profiles.last_name
      } : null
    }));

    setReviews(mappedReviews);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0]) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      setIsUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
        setEditedProfile({ ...profile, avatar_url: publicUrl });
      }

      toast.success("Poza de profil a fost actualizată cu succes");
    } catch (error) {
      toast.error("Nu am putut încărca poza de profil");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          country: editedProfile.country,
          county: editedProfile.county,
          city: editedProfile.city,
          address: editedProfile.address,
          craftsman_type: editedProfile.craftsman_type,
        })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profilul a fost actualizat cu succes");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Nu am putut actualiza profilul");
    }
  };

  const refreshSpecializations = async () => {
    if (user) {
      await fetchSpecializations(user.id);
    }
  };

  const refreshQualifications = async () => {
    if (user) {
      await fetchQualifications(user.id);
    }
  };

  const refreshPortfolios = async () => {
    if (user) {
      await fetchPortfolios(user.id);
    }
  };

  const refreshReviews = async () => {
    if (user) {
      await fetchReviews(user.id);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      console.log("Deleting portfolio:", portfolioId);
      
      const portfolio = portfolios.find(p => p.id === portfolioId);
      if (portfolio) {
        for (const image of portfolio.images) {
          const fileName = image.image_url.split('/').pop();
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('portfolio-images')
              .remove([fileName]);
            
            if (storageError) {
              console.error("Error deleting image from storage:", storageError);
            }
          }
        }
      }

      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;

      toast.success("Portofoliul a fost șters cu succes");
      refreshPortfolios();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast.error("Nu am putut șterge portofoliul");
    }
  };

  if (!user) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Add Chat Dialog Button */}
          <div className="flex justify-end">
            <ChatDialog>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Mesaje
              </Button>
            </ChatDialog>
          </div>

          {/* Add Stats for professionals */}
          {profile?.role === "professional" && (
            <CraftsmanStats craftsmanId={profile.id} />
          )}

          <Card className="bg-white/5 backdrop-blur-lg border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    <Label
                      htmlFor="avatar-upload"
                      className="bg-primary hover:bg-primary/90 text-white rounded-full p-2 cursor-pointer"
                    >
                      {isUploading ? "..." : "📷"}
                    </Label>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    {isEditing ? "Editare Profil" : "Profilul Meu"}
                  </CardTitle>
                  {profile?.role === "professional" && (
                    <div className="text-lg text-muted-foreground mt-2">
                      {profile.trade?.name || "Meserie nesetată"}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {profile?.role === ("professional" as UserRole) ? (
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="specializations">Specializări</TabsTrigger>
                    <TabsTrigger value="qualifications">Calificări</TabsTrigger>
                    <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
                    <TabsTrigger value="reviews">Recenzii</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary">Informații Personale</h3>
                        <div className="space-y-4">
                          {isEditing ? (
                            <>
                              <div className="space-y-2">
                                <Label>Prenume</Label>
                                <Input
                                  value={editedProfile?.first_name || ""}
                                  onChange={(e) =>
                                    setEditedProfile(prev =>
                                      prev ? { ...prev, first_name: e.target.value } : null
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Nume</Label>
                                <Input
                                  value={editedProfile?.last_name || ""}
                                  onChange={(e) =>
                                    setEditedProfile(prev =>
                                      prev ? { ...prev, last_name: e.target.value } : null
                                    )
                                  }
                                />
                              </div>
                              {profile?.role === "professional" && (
                                <div className="space-y-2">
                                  <Label>Tip de Meșter</Label>
                                  <Select
                                    value={editedProfile?.craftsman_type || undefined}
                                    onValueChange={(value: Profile["craftsman_type"]) =>
                                      setEditedProfile(prev =>
                                        prev ? { ...prev, craftsman_type: value } : null
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selectează tipul de meșter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {trades.map((trade) => (
                                        <SelectItem key={trade.id} value={trade.id}>
                                          {trade.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div>
                                <Label className="text-muted-foreground">Nume complet</Label>
                                <p className="text-lg font-medium mt-1">
                                  {profile?.first_name} {profile?.last_name}
                                </p>
                              </div>
                              {profile?.role === "professional" && (
                                <div>
                                  <Label className="text-muted-foreground">Tip de Meșter</Label>
                                  <p className="text-lg font-medium mt-1">
                                    {profile.trade?.name || "Meserie nesetată"}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="text-lg font-medium mt-1">{profile?.email}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Telefon</Label>
                            {isEditing ? (
                              <Input
                                value={editedProfile?.phone || ""}
                                onChange={(e) =>
                                  setEditedProfile(prev =>
                                    prev ? { ...prev, phone: e.target.value } : null
                                  )
                                }
                              />
                            ) : (
                              <p className="text-lg font-medium mt-1">{profile?.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary">Adresă</h3>
                        <div className="space-y-4">
                          {isEditing ? (
                            <>
                              <div className="space-y-2">
                                <Label>Țară</Label>
                                <Input
                                  value={editedProfile?.country || ""}
                                  onChange={(e) =>
                                    setEditedProfile(prev =>
                                      prev ? { ...prev, country: e.target.value } : null
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Județ</Label>
                                <Input
                                  value={editedProfile?.county || ""}
                                  onChange={(e) =>
                                    setEditedProfile(prev =>
                                      prev ? { ...prev, county: e.target.value } : null
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Oraș</Label>
                                <Input
                                  value={editedProfile?.city || ""}
                                  onChange={(e) =>
                                    setEditedProfile(prev =>
                                      prev ? { ...prev, city: e.target.value } : null
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Adresă</Label>
                                <Input
                                  value={editedProfile?.address || ""}
                                  onChange={(e) =>
                                    setEditedProfile(prev =>
                                      prev ? { ...prev, address: e.target.value } : null
                                    )
                                  }
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <Label className="text-muted-foreground">Țară</Label>
                                <p className="text-lg font-medium mt-1">{profile?.country}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Județ</Label>
                                <p className="text-lg font-medium mt-1">{profile?.county}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Oraș</Label>
                                <p className="text-lg font-medium mt-1">{profile?.city}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Adresă</Label>
                                <p className="text-lg font-medium mt-1">{profile?.address}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="specializations">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Specializările Mele</h3>
                        <AddSpecializationDialog onSpecializationAdded={refreshSpecializations} />
                      </div>
                      {specializations.length > 0 ? (
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
                      ) : (
                        <p className="text-muted-foreground">Nu aveți specializări adăugate încă.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="qualifications">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Calificările Mele</h3>
                        <AddQualificationDialog onQualificationAdded={refreshQualifications} />
                      </div>
                      {qualifications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {qualifications.map((qual) => (
                            <Card key={qual.id}>
                              <CardHeader>
                                <CardTitle>{qual.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {qual.issue_date && (
                                  <p className="text-sm text-muted-foreground">
                                    Data emiterii: {new Date(qual.issue_date).toLocaleDateString()}
                                  </p>
                                )}
                                <a
                                  href={qual.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Vezi documentul
                                </a>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nu aveți calificări adăugate încă.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="portfolio">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Portofoliul Meu</h3>
                        <AddPortfolioDialog onPortfolioAdded={refreshPortfolios} />
                      </div>
                      {portfolios.length > 0 ? (
                        <div className="space-y-8">
                          {portfolios.map((portfolio) => (
                            <div key={portfolio.id} className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">{portfolio.title}</h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedPortfolio(portfolio);
                                      setIsEditPortfolioOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Ștergeți portofoliul?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Această acțiune nu poate fi anulată. Portofoliul și toate imaginile asociate vor fi șterse permanent.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeletePortfolio(portfolio.id)}
                                        >
                                          Șterge
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
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
                      ) : (
                        <p className="text-muted-foreground">Nu aveți un portofoliu adăugat încă.</p>
                      )}
                    </div>
                    {selectedPortfolio && (
                      <EditPortfolioDialog
                        portfolio={selectedPortfolio}
                        open={isEditPortfolioOpen}
                        onOpenChange={setIsEditPortfolioOpen}
                        onPortfolioUpdated={refreshPortfolios}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="reviews">
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">Recenziile Clienților</h3>
                      {reviews.length > 0 ? (
                        <div className="grid gap-4">
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
                      ) : (
                        <p className="text-muted-foreground">Nu aveți recenzii încă.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-primary">Informații Personale</h3>
                    <div className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label>Prenume</Label>
                            <Input
                              value={editedProfile?.first_name || ""}
                              onChange={(e) =>
                                setEditedProfile(prev =>
                                  prev ? { ...prev, first_name: e.target.value } : null
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nume</Label>
                            <Input
                              value={editedProfile?.last_name || ""}
                              onChange={(e) =>
                                setEditedProfile(prev =>
                                  prev ? { ...prev, last_name: e.target.value } : null
                                )
                              }
                            />
                          </div>
                          {profile?.role === "professional" && (
                            <div className="space-y-2">
                              <Label>Tip de Meșter</Label>
                              <Select
                                value={editedProfile?.craftsman_type || undefined}
                                onValueChange={(value: Profile["craftsman_type"]) =>
                                  setEditedProfile(prev =>
                                    prev ? { ...prev, craftsman_type: value } : null
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selectează tipul de meșter" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(CRAFTSMAN_TYPES).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <Label className="text-muted-foreground">Nume complet</Label>
                            <p className="text-lg font-medium mt-1">
                              {profile?.first_name} {profile?.last_name}
                            </p>
                          </div>
                          {profile?.role === "professional" && profile?.craftsman_type && (
                            <div>
                              <Label className="text-muted-foreground">Tip de Meșter</Label>
                              <p className="text-lg font-medium mt-1">
                                {CRAFTSMAN_TYPES[profile.craftsman_type] || "Meserie nesetată"}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="text-lg font-medium mt-1">{profile?.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Telefon</Label>
                        {isEditing ? (
                          <Input
                            value={editedProfile?.phone || ""}
                            onChange={(e) =>
                              setEditedProfile(prev =>
                                prev ? { ...prev, phone: e.target.value } : null
                              )
                            }
                          />
                        ) : (
                          <p className="text-lg font-medium mt-1">{profile?.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-primary">Adresă</h3>
                    <div className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label>Țară</Label>
                            <Input
                              value={editedProfile?.country || ""}
                              onChange={(e) =>
                                setEditedProfile(prev =>
                                  prev ? { ...prev, country: e.target.value } : null
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Județ</Label>
                            <Input
                              value={editedProfile?.county || ""}
                              onChange={(e) =>
                                setEditedProfile(prev =>
                                  prev ? { ...prev, county: e.target.value } : null
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Oraș</Label>
                            <Input
                              value={editedProfile?.city || ""}
                              onChange={(e) =>
                                setEditedProfile(prev =>
                                  prev ? { ...prev, city: e.target.value } : null
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Adresă</Label>
                            <Input
                              value={editedProfile?.address || ""}
                              onChange={(e) =>
                                setEditedProfile(prev =>
                                  prev ? { ...prev, address: e.target.value } : null
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label className="text-muted-foreground">Țară</Label>
                            <p className="text-lg font-medium mt-1">{profile?.country}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Județ</Label>
                            <p className="text-lg font-medium mt-1">{profile?.county}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Oraș</Label>
                            <p className="text-lg font-medium mt-1">{profile?.city}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Adresă</Label>
                            <p className="text-lg font-medium mt-1">{profile?.address}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Anulează
                    </Button>
                    <Button onClick={handleSave}>
                      Salvează
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Editează profilul
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientProfile;
