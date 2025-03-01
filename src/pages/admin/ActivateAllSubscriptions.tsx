
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

export const ActivateAllSubscriptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const activateAllSubscriptions = async () => {
    setIsLoading(true);
    setIsComplete(false);
    setProcessed(0);
    
    try {
      // Get all professional accounts
      const { data: professionals, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'professional');

      if (error) {
        throw error;
      }

      setTotal(professionals.length);
      
      // Target end date: July 1, 2025
      const endDate = new Date(2025, 6, 1).toISOString();
      
      // Process each professional account
      for (const prof of professionals) {
        try {
          const { error: rpcError } = await supabase
            .rpc('update_craftsman_subscription_status', {
              p_craftsman_id: prof.id,
              p_is_active: true,
              p_end_date: endDate
            });

          if (rpcError) {
            console.error(`Error activating subscription for user ${prof.id}:`, rpcError);
          }
          
          setProcessed(prev => prev + 1);
        } catch (e) {
          console.error(`Exception for user ${prof.id}:`, e);
          setProcessed(prev => prev + 1);
        }
      }
      
      setIsComplete(true);
      toast.success(`Abonamentele au fost activate cu succes pentru ${professionals.length} meșteri!`);
      
      // Log admin action
      await supabase.from("admin_audit_logs").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: "activate_all_subscriptions",
        entity_type: "subscriptions",
        details: { end_date: endDate, count: professionals.length }
      });
      
    } catch (error) {
      console.error('Error activating subscriptions:', error);
      toast.error('A apărut o eroare la activarea abonamentelor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Activare Abonamente pentru Toți Meșterii</h2>
        
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Această funcție va activa abonamentele pentru toți meșterii înregistrați în platformă,
            setând data de expirare la 1 Iulie 2025.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <p className="text-yellow-800 font-medium">Atenție!</p>
            <p className="text-yellow-700">
              Această acțiune va suprascrie orice abonament existent și va seta toate abonamentele 
              ca fiind active până la data de 1 Iulie 2025.
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Se procesează meșterii ({processed}/{total})...</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${total ? (processed / total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        ) : isComplete ? (
          <div className="flex items-center space-x-3 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Abonamentele au fost activate cu succes pentru {processed} meșteri!</span>
          </div>
        ) : (
          <Button onClick={activateAllSubscriptions}>
            Activează toate abonamentele
          </Button>
        )}
      </Card>
    </div>
  );
};

export default ActivateAllSubscriptions;
