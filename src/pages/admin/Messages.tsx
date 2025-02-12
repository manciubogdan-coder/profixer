
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { MessageSquare, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface MessageWithUsers {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: {
    first_name: string;
    last_name: string;
    email: string;
  };
  receiver: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const Messages = () => {
  const [messages, setMessages] = useState<MessageWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [showUnreadOnly]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:user_profiles_with_email!messages_sender_id_fkey(first_name, last_name, email),
          receiver:user_profiles_with_email!messages_receiver_id_fkey(first_name, last_name, email)
        `)
        .order("created_at", { ascending: false });

      if (showUnreadOnly) {
        query = query.eq("read", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error("Eroare la încărcarea mesajelor:", error);
      toast.error("Nu am putut încărca lista mesajelor");
    } finally {
      setLoading(false);
    }
  };

  const toggleMessageRead = async (messageId: string, currentReadState: boolean) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: !currentReadState })
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.map(message => 
        message.id === messageId 
          ? { ...message, read: !currentReadState }
          : message
      ));

      toast.success(
        currentReadState 
          ? "Mesaj marcat ca necitit" 
          : "Mesaj marcat ca citit"
      );
    } catch (error) {
      console.error("Eroare la actualizarea stării mesajului:", error);
      toast.error("Nu am putut actualiza starea mesajului");
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.filter(message => message.id !== messageId));
      toast.success("Mesaj șters cu succes");
    } catch (error) {
      console.error("Eroare la ștergerea mesajului:", error);
      toast.error("Nu am putut șterge mesajul");
    }
  };

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mesaje</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Doar necitite</span>
          <Switch
            checked={showUnreadOnly}
            onCheckedChange={setShowUnreadOnly}
          />
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nu există mesaje în sistem.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expeditor</TableHead>
              <TableHead>Destinatar</TableHead>
              <TableHead>Mesaj</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Stare</TableHead>
              <TableHead>Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id} className={!message.read ? "bg-muted/50" : undefined}>
                <TableCell>
                  {message.sender.first_name} {message.sender.last_name}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {message.sender.email}
                  </span>
                </TableCell>
                <TableCell>
                  {message.receiver.first_name} {message.receiver.last_name}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {message.receiver.email}
                  </span>
                </TableCell>
                <TableCell>{message.content}</TableCell>
                <TableCell>
                  {new Date(message.created_at).toLocaleString("ro-RO")}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleMessageRead(message.id, message.read)}
                  >
                    <CheckCircle className={`h-4 w-4 ${message.read ? "text-primary" : "text-muted-foreground"}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ChatDialog
                      recipientId={message.receiver.email}
                      recipientName={`${message.receiver.first_name} ${message.receiver.last_name}`}
                    >
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Răspunde
                      </Button>
                    </ChatDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Această acțiune nu poate fi anulată. Mesajul va fi șters permanent.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMessage(message.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Șterge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
