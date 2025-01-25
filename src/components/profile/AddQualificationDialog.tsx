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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function AddQualificationDialog({ onQualificationAdded }: { onQualificationAdded: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Trebuie să fiți autentificat pentru a adăuga o calificare");
      return;
    }

    if (!document) {
      toast.error("Vă rugăm să selectați un document");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting qualification upload for user:", user.id);
      
      // Upload document to storage
      const fileExt = document.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('qualification-docs')
        .upload(fileName, document);

      if (uploadError) {
        console.error("Document upload error:", uploadError);
        throw uploadError;
      }

      console.log("Document uploaded successfully");

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('qualification-docs')
        .getPublicUrl(fileName);

      // Insert qualification record
      const { error: dbError } = await supabase
        .from("qualifications")
        .insert([
          {
            title,
            issue_date: issueDate,
            document_url: publicUrl,
            craftsman_id: user.id
          },
        ]);

      if (dbError) {
        console.error("Database insertion error:", dbError);
        throw dbError;
      }

      console.log("Qualification record created successfully");
      toast.success("Calificare adăugată cu succes");
      setOpen(false);
      onQualificationAdded();
      setTitle("");
      setIssueDate("");
      setDocument(null);
    } catch (error) {
      console.error("Error adding qualification:", error);
      toast.error("Nu am putut adăuga calificarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adaugă Calificare</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adaugă o nouă calificare</DialogTitle>
          <DialogDescription>
            Adăugați detaliile calificării și încărcați documentul aferent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titlu calificare</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="issueDate">Data emiterii</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="document">Document</Label>
            <Input
              id="document"
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              onChange={(e) => setDocument(e.target.files?.[0] || null)}
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