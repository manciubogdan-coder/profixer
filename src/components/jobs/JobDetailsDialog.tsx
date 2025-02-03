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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Banknote, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatDialog } from "@/components/chat/ChatDialog";

interface JobDetailsDialogProps {
  job: {
    id: string;
    title: string;
    description: string;
    county: string;
    city: string;
    budget?: number;
    start_date?: string;
    images?: string[];
    client: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
    trade: {
      name: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const sendMessage = async () => {
    if (!user || !message.trim()) return;

    try {
      const { error } = await supabase.from("messages").insert([
        {
          sender_id: user.id,
          receiver_id: job.client.id,
          content: `Ofertă pentru lucrarea "${job.title}": ${message}`,
        },
      ]);

      if (error) throw error;

      toast.success("Mesajul a fost trimis cu succes!");
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Nu am putut trimite mesajul");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{job.title}</span>
            <Badge variant="secondary">{job.trade.name}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={job.client.avatar_url} />
                <AvatarFallback>
                  {job.client.first_name[0]}
                  {job.client.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {job.client.first_name} {job.client.last_name}
                </p>
                <p className="text-sm text-muted-foreground">Client</p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">{job.description}</p>

          <div className="grid gap-2">
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              {job.city}, {job.county}
            </div>
            {job.budget && (
              <div className="flex items-center text-sm">
                <Banknote className="w-4 h-4 mr-2 text-muted-foreground" />
                {job.budget} RON
              </div>
            )}
            {job.start_date && (
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                {format(new Date(job.start_date), "d MMMM yyyy", { locale: ro })}
              </div>
            )}
          </div>

          {job.images && job.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {job.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Imagine ${index + 1}`}
                  className="rounded-lg object-cover w-full h-48"
                />
              ))}
            </div>
          )}

          {user && user.id !== job.client.id && (
            <div className="space-y-2">
              <Textarea
                placeholder="Scrie un mesaj pentru client..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Trimite ofertă
                </Button>
                <ChatDialog recipientId={job.client.id} recipientName={`${job.client.first_name} ${job.client.last_name}`}>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Deschide chat
                  </Button>
                </ChatDialog>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}