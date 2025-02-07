
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";

export function AddJobListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trade_id: "",
    country: "România",
    county: "",
    city: "",
    start_date: "",
    estimated_time: "",
    budget: "",
  });

  // Fetch user profile to verify role
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });

  const { data: trades } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error('Error fetching trades:', error);
        throw error;
      }
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Trebuie să fiți autentificat pentru a adăuga o lucrare");
      return;
    }

    if (userProfile?.role !== 'client') {
      toast.error("Doar clienții pot adăuga lucrări");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating job listing with data:', {
        ...formData,
        client_id: user.id,
      });

      // First create the job listing
      const { data: jobData, error: jobError } = await supabase
        .from("job_listings")
        .insert([
          {
            ...formData,
            client_id: user.id,
            budget: parseFloat(formData.budget),
            start_date: new Date(formData.start_date).toISOString(),
          },
        ])
        .select()
        .single();

      if (jobError) {
        console.error("Error creating job:", jobError);
        throw jobError;
      }

      console.log('Job listing created successfully:', jobData);

      // Then upload images if any
      if (images?.length) {
        const imagePromises = Array.from(images).map(async (image) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;

          console.log('Uploading image:', fileName);

          const { error: uploadError } = await supabase.storage
            .from('job-listings')
            .upload(fileName, image);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('job-listings')
            .getPublicUrl(fileName);

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(imagePromises);
        console.log('Images uploaded successfully:', uploadedUrls);

        // Update job listing with image URLs
        const { error: updateError } = await supabase
          .from("job_listings")
          .update({ images: uploadedUrls })
          .eq("id", jobData.id);

        if (updateError) {
          console.error('Error updating job with images:', updateError);
          throw updateError;
        }
      }

      toast.success("Lucrare adăugată cu succes");
      navigate("/jobs");
    } catch (error) {
      console.error("Error adding job listing:", error);
      toast.error("Nu am putut adăuga lucrarea. Verificați dacă aveți rolul de client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Adaugă o lucrare nouă</h1>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <Label htmlFor="title">Titlu</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="trade">Categorie meșter</Label>
            <Select
              value={formData.trade_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, trade_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează categoria" />
              </SelectTrigger>
              <SelectContent>
                {trades?.map((trade) => (
                  <SelectItem key={trade.id} value={trade.id}>
                    {trade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="county">Județ</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">Oraș</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date">Data începerii</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="estimated_time">Timp estimat</Label>
              <Input
                id="estimated_time"
                value={formData.estimated_time}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
                placeholder="ex: 2-3 zile"
                required
              />
            </div>
            <div>
              <Label htmlFor="budget">Buget (RON)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Imagini</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(e.target.files)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se adaugă..." : "Adaugă lucrare"}
          </Button>
        </form>
      </div>
    </>
  );
}
