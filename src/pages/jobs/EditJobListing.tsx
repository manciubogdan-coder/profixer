
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EditJobListing = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    county: "",
    budget: "",
    start_date: "",
    trade_id: "",
    estimated_time: "",
  });

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("job_listings")
        .select(`
          *,
          trade:trades(
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: trades = [] } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a edita o lucrare");
      navigate("/auth");
      return;
    }

    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        city: job.city,
        county: job.county,
        budget: job.budget?.toString() || "",
        start_date: job.start_date || "",
        trade_id: job.trade_id || "",
        estimated_time: job.estimated_time,
      });
    }
  }, [user, job, navigate]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("job_listings")
        .update({
          title: formData.title,
          description: formData.description,
          city: formData.city,
          county: formData.county,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          start_date: formData.start_date || null,
          trade_id: formData.trade_id || null,
          estimated_time: formData.estimated_time,
        })
        .eq("id", id as string);

      if (error) throw error;

      toast.success("Lucrarea a fost actualizată cu succes");
      navigate("/jobs/my");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("A apărut o eroare la actualizarea lucrării");
    }
  };

  if (isLoadingJob) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">Se încarcă...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8">Lucrarea nu a fost găsită</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Editează Lucrarea</h1>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titlu</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descriere</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Oraș</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">Județ</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) =>
                      setFormData({ ...formData, county: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Buget (RON)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Data începerii</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade">Meserie</Label>
                <Select
                  value={formData.trade_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trade_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează meseria" />
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

              <div className="space-y-2">
                <Label htmlFor="estimated_time">Timp estimat</Label>
                <Select
                  value={formData.estimated_time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, estimated_time: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează timpul estimat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 zile">1-2 zile</SelectItem>
                    <SelectItem value="3-5 zile">3-5 zile</SelectItem>
                    <SelectItem value="1-2 săptămâni">1-2 săptămâni</SelectItem>
                    <SelectItem value="2-4 săptămâni">2-4 săptămâni</SelectItem>
                    <SelectItem value="1-2 luni">1-2 luni</SelectItem>
                    <SelectItem value="2-6 luni">2-6 luni</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/jobs/my")}
                >
                  Anulează
                </Button>
                <Button type="submit">Salvează</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
