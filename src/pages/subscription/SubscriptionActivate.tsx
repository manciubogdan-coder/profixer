
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { activateInitialSubscription } from "@/lib/subscription";
import { toast } from "sonner";

const SubscriptionActivate: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleActivate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Set the subscription end date to July 1, 2025
      const endDate = new Date(2025, 6, 1);
      const success = await activateInitialSubscription(user.id, endDate);
      
      if (success) {
        setActivated(true);
        toast.success("Subscription activated successfully!");
      } else {
        toast.error("Failed to activate subscription");
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast.error("An error occurred while activating your subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Activate Subscription</CardTitle>
          <CardDescription>
            Activate your subscription to access all professional features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activated ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">
                Your subscription has been activated successfully!
              </p>
              <p>
                You now have access to all professional features until July 1, 2025.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                By activating your subscription, you'll get access to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Advanced job listing visibility</li>
                <li>Priority in search results</li>
                <li>Additional profile customization options</li>
              </ul>
              <Button 
                onClick={handleActivate} 
                disabled={loading || !user || profile?.role !== "professional"}
                className="w-full"
              >
                {loading ? "Activating..." : "Activate Subscription"}
              </Button>
              {profile?.role !== "professional" && (
                <p className="text-sm text-amber-600">
                  Only professional accounts can activate subscriptions.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionActivate;
