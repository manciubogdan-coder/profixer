import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CraftsmanPortfolioProps {
  craftsmanId: string;
}

export const CraftsmanPortfolio = ({ craftsmanId }: CraftsmanPortfolioProps) => {
  const { data: portfolios } = useQuery({
    queryKey: ["craftsman-portfolio", craftsmanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select(`
          *,
          portfolio_images (
            id,
            image_url
          )
        `)
        .eq("craftsman_id", craftsmanId);

      if (error) {
        console.error("Error fetching portfolio:", error);
        return [];
      }

      return data;
    },
  });

  if (!portfolios?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portofoliu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nu există proiecte în portofoliu.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portofoliu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="space-y-2">
              <h3 className="font-medium">{portfolio.title}</h3>
              {portfolio.description && (
                <p className="text-sm text-muted-foreground">{portfolio.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {portfolio.portfolio_images?.map((image) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt={portfolio.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};