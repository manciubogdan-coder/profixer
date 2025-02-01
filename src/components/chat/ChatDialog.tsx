import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, Trash2 } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Conversation {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatDialogProps {
  children?: React.ReactNode;
  recipientId?: string;
  recipientName?: string;
}

export function ChatDialog({ children, recipientId, recipientName }: ChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<{id: string; name: string} | null>(null);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    console.log("Fetching conversations...");
    
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      console.log("Fetched messages:", messages);

      // Process messages into conversations
      const conversationsMap = new Map();

      messages.forEach((message) => {
        const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
        if (!otherUser) return;

        const conversationKey = otherUser.id;
        
        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            user: otherUser,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: message.receiver_id === user.id && !message.read ? 1 : 0
          });
        } else if (!message.read && message.receiver_id === user.id) {
          const conversation = conversationsMap.get(conversationKey);
          conversation.unread_count += 1;
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error processing conversations:", error);
    }
  };

  const deleteConversation = async (userId: string) => {
    if (!user) return;

    try {
      // Delete all messages between the current user and the selected user
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`);

      if (error) {
        console.error("Error deleting conversation:", error);
        toast.error("Nu am putut șterge conversația");
        return;
      }

      toast.success("Conversația a fost ștearsă");
      fetchConversations();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Nu am putut șterge conversația");
    }
  };

  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [user, open]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          fetchConversations(); // Refresh conversations when new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (recipientId && recipientName) {
      setSelectedUser({ id: recipientId, name: recipientName });
    }
  }, [recipientId, recipientName]);

  const handleUserSelect = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      <DialogContent className="max-w-[100dvw] h-[100dvh] p-0 md:max-w-[800px] md:h-[80vh] md:max-h-[700px] md:p-6 flex flex-col">
        <DialogHeader className="p-4 md:p-0">
          <div className="flex items-center justify-between">
            {selectedUser && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedUser(null)}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>Mesaje</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {!selectedUser ? (
            <div className="h-full overflow-y-auto p-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  className="flex items-center justify-between p-4 hover:bg-accent rounded-lg cursor-pointer"
                >
                  <div 
                    className="flex-1"
                    onClick={() => handleUserSelect(
                      conversation.user.id,
                      `${conversation.user.first_name} ${conversation.user.last_name}`
                    )}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {conversation.user.first_name} {conversation.user.last_name}
                      </h4>
                      {conversation.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground px-2 rounded-full text-sm">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Șterge conversația</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ești sigur că vrei să ștergi această conversație? Această acțiune nu poate fi anulată.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteConversation(conversation.user.id)}
                        >
                          Șterge
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <ChatInterface
              recipientId={selectedUser.id}
              recipientName={selectedUser.name}
              onBack={() => setSelectedUser(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}