import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
  onBack?: () => void;
}

export const ChatInterface = ({ recipientId, recipientName, onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      console.log("Fetching messages for conversation between", user.id, "and", recipientId);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${recipientId},receiver_id.eq.${recipientId}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Nu am putut încărca mesajele");
        return;
      }

      console.log("Fetched messages:", data);
      setMessages(data || []);
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id},receiver_id=eq.${recipientId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("messages").insert([
        {
          sender_id: user.id,
          receiver_id: recipientId,
          content: newMessage.trim(),
        },
      ]);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Nu am putut trimite mesajul");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-background border rounded-lg">
      <div className="p-4 border-b flex items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">{recipientName}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.sender_id === user?.id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.sender?.avatar_url || undefined} />
                <AvatarFallback>
                  {message.sender?.first_name?.[0]}
                  {message.sender?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Scrie un mesaj..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};