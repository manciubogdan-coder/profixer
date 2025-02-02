import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CraftsmanSpecializationsProps {
  craftsmanId: string;
}

export const CraftsmanSpecializations = ({ craftsmanId }: CraftsmanSpecializationsProps) => {
  const { data: specializations } = useQuery({
    queryKey: ["craftsman-specializations", craftsmanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specializations")
        .select("*")
        .eq("craftsman_id", craftsmanId);

      if (error) {
        console.error("Error fetching specializations:", error);
        return [];
      }

      return data;
    },
  });

  if (!specializations?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Specializări</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nu există specializări adăugate.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specializări</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {specializations.map((specialization) => (
            <div key={specialization.id} className="space-y-2">
              <h4 className="font-medium">{specialization.name}</h4>
              {specialization.description && (
                <p className="text-sm text-muted-foreground">{specialization.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};