
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
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface MessageWithUsers {
  id: string;
  content: string;
  created_at: string;
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

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:user_profiles_with_email!messages_sender_id_fkey(first_name, last_name, email),
          receiver:user_profiles_with_email!messages_receiver_id_fkey(first_name, last_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error("Eroare la încărcarea mesajelor:", error);
      toast.error("Nu am putut încărca lista mesajelor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mesaje</h2>
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
              <TableHead>Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
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
                  <ChatDialog
                    recipientId={message.receiver.email}
                    recipientName={`${message.receiver.first_name} ${message.receiver.last_name}`}
                  >
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Răspunde
                    </Button>
                  </ChatDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
