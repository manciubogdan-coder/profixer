import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AddQualificationDialog({ onQualificationAdded }: { onQualificationAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) {
      toast.error("Vă rugăm să selectați un document");
      return;
    }

    setIsSubmitting(true);

    try {
      const fileExt = document.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('qualification-docs')
        .upload(fileName, document);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("qualifications")
        .insert([
          {
            title,
            issue_date: issueDate,
            document_url: `${supabase.storageUrl}/object/public/qualification-docs/${fileName}`,
          },
        ]);

      if (dbError) throw dbError;

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
              accept=".pdf,.doc,.docx"
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