import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tradeId, setTradeId] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const { user } = useAuth();

  const { data: trades } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const uploadImages = async (files: FileList) => {
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('job-listings')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('job-listings')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      let images = [];
      if (files && files.length > 0) {
        images = await uploadImages(files);
      }

      const { error } = await supabase.from("job_listings").insert([
        {
          title,
          description,
          trade_id: tradeId,
          client_id: user.id,
          county,
          city,
          budget: budget ? parseFloat(budget) : null,
          start_date: startDate || null,
          images
        },
      ]);

      if (error) throw error;

      toast.success("Lucrarea a fost adăugată cu succes!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Nu am putut adăuga lucrarea");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTradeId("");
    setCounty("");
    setCity("");
    setBudget("");
    setStartDate("");
    setFiles(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adaugă o lucrare nouă</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titlu</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade">Categorie meșter</Label>
            <Select value={tradeId} onValueChange={setTradeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Alege categoria" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">Județ</Label>
              <Input
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Oraș</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Buget (RON)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Data începerii</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Imagini</Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                onChange={(e) => setFiles(e.target.files)}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("images")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Încarcă imagini
              </Button>
              {files && (
                <span className="text-sm text-muted-foreground">
                  {files.length} {files.length === 1 ? "imagine" : "imagini"} selectate
                </span>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Se adaugă..." : "Adaugă lucrare"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}