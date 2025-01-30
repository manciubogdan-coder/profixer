import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddReviewDialogProps {
  children: React.ReactNode;
  craftsman: {
    id: string;
  };
}

export function AddReviewDialog({ children, craftsman }: AddReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a lăsa o recenzie");
      return;
    }

    if (rating === 0) {
      toast.error("Te rugăm să selectezi un rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Te rugăm să adaugi un comentariu");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        craftsman_id: craftsman.id,
        client_id: user.id,
        rating,
        comment: comment.trim(),
      });

      if (error) throw error;

      toast.success("Recenzia a fost adăugată cu succes!");
      setIsOpen(false);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("A apărut o eroare la adăugarea recenziei");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adaugă o recenzie</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    i < rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Textarea
              placeholder="Scrie recenzia ta aici..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Se trimite..." : "Trimite recenzia"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}