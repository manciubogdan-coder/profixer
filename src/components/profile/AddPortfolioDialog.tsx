import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function AddPortfolioDialog({ onPortfolioAdded }: { onPortfolioAdded: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images?.length) {
      toast.error("Vă rugăm să selectați cel puțin o imagine");
      return;
    }

    if (!user) {
      toast.error("Trebuie să fiți autentificat pentru a adăuga un portofoliu");
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the portfolio entry
      const { data: portfolioData, error: portfolioError } = await supabase
        .from("portfolios")
        .insert([
          {
            title,
            description,
            craftsman_id: user.id
          },
        ])
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Then upload each image and create portfolio_images entries
      const imagePromises = Array.from(images).map(async (image) => {
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        return supabase
          .from("portfolio_images")
          .insert([
            {
              portfolio_id: portfolioData.id,
              image_url: publicUrl,
            },
          ]);
      });

      await Promise.all(imagePromises);

      toast.success("Portofoliu adăugat cu succes");
      setOpen(false);
      onPortfolioAdded();
      setTitle("");
      setDescription("");
      setImages(null);
    } catch (error) {
      console.error("Error adding portfolio:", error);
      toast.error("Nu am putut adăuga portofoliul");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adaugă Portofoliu</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adaugă un nou portofoliu</DialogTitle>
          <DialogDescription>
            Adăugați detaliile portofoliului și încărcați imaginile relevante.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titlu</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="images">Imagini</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(e.target.files)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se adaugă..." : "Adaugă"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}