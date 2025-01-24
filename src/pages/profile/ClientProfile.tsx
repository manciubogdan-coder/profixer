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
import { Database } from "@/integrations/supabase/types";

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
  craftsman_type?: Database["public"]["Enums"]["craftsman_type"] | null;
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
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

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
          toast.error("Nu am putut încărca profilul. Vă rugăm să încercați din nou.");
          return;
        }

        if (data) {
          console.log("Profile data:", data);
          const profileData = { ...data, email: user.email };
          setProfile(profileData);
          setEditedProfile(profileData);

          if (data.role === "professional") {
            await Promise.all([
              fetchSpecializations(user.id),
              fetchQualifications(user.id),
              fetchPortfolio(user.id)
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

  const fetchPortfolio = async (userId: string) => {
    const { data: portfolioData, error: portfolioError } = await supabase
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
      .maybeSingle();

    if (portfolioError) {
      console.error("Error fetching portfolio:", portfolioError);
      return;
    }

    if (portfolioData) {
      setPortfolio({
        ...portfolioData,
        images: portfolioData.portfolio_images || []
      });
    }
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

  const refreshPortfolio = async () => {
    if (user) {
      await fetchPortfolio(user.id);
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
                  {profile?.role === "professional" && profile.craftsman_type && (
                    <div className="text-lg text-muted-foreground mt-2">
                      {CRAFTSMAN_TYPES[profile.craftsman_type]}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {profile?.role === ("professional" as UserRole) ? (
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="specializations">Specializări</TabsTrigger>
                    <TabsTrigger value="qualifications">Calificări</TabsTrigger>
                    <TabsTrigger value="portfolio">Portofoliu</TabsTrigger>
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
                                    {CRAFTSMAN_TYPES[profile.craftsman_type]}
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
                        <AddPortfolioDialog onPortfolioAdded={refreshPortfolio} />
                      </div>
                      {portfolio ? (
                        <div>
                          <h4 className="text-lg font-medium">{portfolio.title}</h4>
                          {portfolio.description && (
                            <p className="text-muted-foreground mt-2">{portfolio.description}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                      ) : (
                        <p className="text-muted-foreground">Nu aveți un portofoliu adăugat încă.</p>
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
                                {CRAFTSMAN_TYPES[profile.craftsman_type]}
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
