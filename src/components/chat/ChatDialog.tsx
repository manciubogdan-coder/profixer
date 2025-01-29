import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
  };
  unread_count: number;
}

export function ChatDialog() {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<{id: string; name: string} | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !open) return;

    const fetchConversations = async () => {
      console.log("Fetching conversations for user:", user.id);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          sender:profiles!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          content,
          created_at,
          read
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      console.log("Fetched messages:", data);

      // Process conversations
      const conversationsMap = new Map<string, Conversation>();
      
      data?.forEach((message) => {
        const otherUser = message.sender.id === user.id ? message.receiver : message.sender;
        const existingConv = conversationsMap.get(otherUser.id);
        
        if (!existingConv || new Date(existingConv.last_message.created_at) < new Date(message.created_at)) {
          conversationsMap.set(otherUser.id, {
            profile: otherUser,
            last_message: {
              content: message.content,
              created_at: message.created_at,
            },
            unread_count: message.read ? 0 : 1,
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    };

    fetchConversations();
  }, [user, open]);

  const handleUserSelect = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[700px]">
        <DialogHeader>
          <DialogTitle>Mesaje</DialogTitle>
        </DialogHeader>
        <div className="flex h-full gap-4">
          {!selectedUser ? (
            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.profile.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleUserSelect(
                      conv.profile.id,
                      `${conv.profile.first_name} ${conv.profile.last_name}`
                    )}
                  >
                    <Avatar>
                      <AvatarImage src={conv.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {conv.profile.first_name[0]}
                        {conv.profile.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conv.profile.first_name} {conv.profile.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message.content}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conv.last_message.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setSelectedUser(null)}
              >
                ← Înapoi
              </Button>
              <ChatInterface
                recipientId={selectedUser.id}
                recipientName={selectedUser.name}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}