import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  images: { id: string; image_url: string }[];
}

interface EditPortfolioDialogProps {
  portfolio: Portfolio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPortfolioUpdated: () => void;
}

export function EditPortfolioDialog({
  portfolio,
  open,
  onOpenChange,
  onPortfolioUpdated,
}: EditPortfolioDialogProps) {
  const [title, setTitle] = useState(portfolio.title);
  const [description, setDescription] = useState(portfolio.description || "");
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(portfolio.title);
    setDescription(portfolio.description || "");
  }, [portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update portfolio details
      const { error: updateError } = await supabase
        .from("portfolios")
        .update({
          title,
          description,
        })
        .eq("id", portfolio.id);

      if (updateError) throw updateError;

      // Upload new images if any
      if (newImages?.length) {
        const imagePromises = Array.from(newImages).map(async (image) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
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
                portfolio_id: portfolio.id,
                image_url: publicUrl,
              },
            ]);
        });

        await Promise.all(imagePromises);
      }

      toast.success("Portofoliu actualizat cu succes");
      onOpenChange(false);
      onPortfolioUpdated();
    } catch (error) {
      console.error("Error updating portfolio:", error);
      toast.error("Nu am putut actualiza portofoliul");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editează portofoliul</DialogTitle>
          <DialogDescription>
            Modifică detaliile portofoliului și adaugă imagini noi dacă dorești.
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
            <Label htmlFor="newImages">Adaugă imagini noi</Label>
            <Input
              id="newImages"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewImages(e.target.files)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {portfolio.images.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt="Imagine portofoliu"
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se actualizează..." : "Actualizează"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}