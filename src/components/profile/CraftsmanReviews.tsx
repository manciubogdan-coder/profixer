import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface CraftsmanReviewsProps {
  craftsmanId: string;
}

export const CraftsmanReviews = ({ craftsmanId }: CraftsmanReviewsProps) => {
  const { data: reviews } = useQuery({
    queryKey: ["craftsman-reviews", craftsmanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          client:profiles!reviews_client_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("craftsman_id", craftsmanId);

      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }

      return data;
    },
  });

  if (!reviews?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recenzii</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nu există recenzii încă.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recenzii</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.client?.avatar_url || undefined} />
                  <AvatarFallback>
                    {`${review.client?.first_name?.[0]}${review.client?.last_name?.[0]}`}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {review.client?.first_name} {review.client?.last_name}
                    </h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                  {review.craftsman_response && (
                    <div className="mt-4 pl-4 border-l-2 border-muted">
                      <p className="text-sm text-muted-foreground italic">
                        {review.craftsman_response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};