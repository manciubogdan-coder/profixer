import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  avatar_url?: string | null;
  craftsman_type?: "carpenter" | "plumber" | "electrician" | "painter" | "mason" | "welder" | "locksmith" | "roofer" | "hvac_technician" | "general_contractor" | null;
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
};

const ClientProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);

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
          const profileData = { ...data, email: user.email };
          setProfile(profileData);
          setEditedProfile(profileData);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0]) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      setUploading(true);

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

      toast({
        title: "Succes",
        description: "Poza de profil a fost actualizată cu succes",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut încărca poza de profil",
      });
    } finally {
      setUploading(false);
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
      toast({
        title: "Succes",
        description: "Profilul a fost actualizat cu succes",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Nu am putut actualiza profilul",
      });
    }
  };

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
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto">
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
                    disabled={uploading}
                  />
                  <Label
                    htmlFor="avatar-upload"
                    className="bg-primary hover:bg-primary/90 text-white rounded-full p-2 cursor-pointer"
                  >
                    {uploading ? "..." : "📷"}
                  </Label>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                {isEditing ? "Editare Profil" : "Profilul Meu"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
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
    </div>
  );
};

export default ClientProfile;