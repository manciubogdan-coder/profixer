import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CraftsmanQualificationsProps {
  craftsmanId: string;
}

export const CraftsmanQualifications = ({ craftsmanId }: CraftsmanQualificationsProps) => {
  const { data: qualifications } = useQuery({
    queryKey: ["craftsman-qualifications", craftsmanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qualifications")
        .select("*")
        .eq("craftsman_id", craftsmanId);

      if (error) {
        console.error("Error fetching qualifications:", error);
        return [];
      }

      return data;
    },
  });

  if (!qualifications?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calificări</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nu există calificări adăugate.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calificări</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {qualifications.map((qualification) => (
            <div key={qualification.id} className="space-y-2">
              <h4 className="font-medium">{qualification.title}</h4>
              {qualification.issue_date && (
                <p className="text-sm text-muted-foreground">
                  Data emiterii: {new Date(qualification.issue_date).toLocaleDateString()}
                </p>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={qualification.document_url} target="_blank" rel="noopener noreferrer">
                  Vezi document
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};