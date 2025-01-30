import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface ReviewSectionProps {
  craftsman: {
    id: string;
    reviews: Review[];
  };
}

export function ReviewSection({ craftsman }: ReviewSectionProps) {
  const { user } = useAuth();
  const reviews = craftsman.reviews || [];

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Nu există recenzii încă.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.user.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {review.user.first_name} {review.user.last_name}
                    </h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("ro-RO")}
                  </time>
                </div>
                <p className="mt-2 text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}