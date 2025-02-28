import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MessageWithUsers {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender: {
    first_name: string;
    last_name: string;
    email: string;
    county: string;
    city: string;
    role: string;
  };
  receiver: {
    first_name: string;
    last_name: string;
    email: string;
    county: string;
    city: string;
    role: string;
  };
}

interface MessageStatistics {
  month: string;
  total_messages: number;
  unique_senders: number;
  unique_receivers: number;
  messages_from_clients: number;
  messages_from_craftsmen: number;
}

export const Messages = () => {
  const [messages, setMessages] = useState<MessageWithUsers[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    sender: "",
    receiver: "",
    role: "all",
    dateRange: undefined as DateRange | undefined
  });
  const [statistics, setStatistics] = useState<MessageStatistics[]>([]);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from("messages_statistics")
        .select("*");

      if (error) throw error;
      setStatistics(data || []);
    } catch (error) {
      console.error("Eroare la încărcarea statisticilor:", error);
      toast.error("Nu am putut încărca statisticile");
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStatistics();
  }, [showUnreadOnly]);

  useEffect(() => {
    applyFilters();
  }, [messages, filters, showUnreadOnly]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:user_profiles_with_email!messages_sender_id_fkey(
            first_name, last_name, email, county, city, role
          ),
          receiver:user_profiles_with_email!messages_receiver_id_fkey(
            first_name, last_name, email, county, city, role
          )
        `)
        .order("created_at", { ascending: false });

      if (showUnreadOnly) {
        query = query.eq("read", false);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log("Messages data:", data); // Pentru debugging

      const formattedMessages: MessageWithUsers[] = (data || [])
        .filter(message => message.sender && message.receiver) // Filtrăm mesajele care nu au sender sau receiver
        .map(message => ({
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          read: message.read || false,
          sender: Array.isArray(message.sender) ? message.sender[0] : message.sender,
          receiver: Array.isArray(message.receiver) ? message.receiver[0] : message.receiver
        }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Eroare la încărcarea mesajelor:", error);
      toast.error("Nu am putut încărca lista mesajelor");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Filtrare după text (căutare în conținut)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((message) =>
        message.content.toLowerCase().includes(searchLower)
      );
    }

    // Filtrare după expeditor
    if (filters.sender) {
      const senderLower = filters.sender.toLowerCase();
      filtered = filtered.filter((message) =>
        message.sender && (
          `${message.sender.first_name} ${message.sender.last_name}`
            .toLowerCase()
            .includes(senderLower) ||
          message.sender.email.toLowerCase().includes(senderLower)
        )
      );
    }

    // Filtrare după destinatar
    if (filters.receiver) {
      const receiverLower = filters.receiver.toLowerCase();
      filtered = filtered.filter((message) =>
        message.receiver && (
          `${message.receiver.first_name} ${message.receiver.last_name}`
            .toLowerCase()
            .includes(receiverLower) ||
          message.receiver.email.toLowerCase().includes(receiverLower)
        )
      );
    }

    // Filtrare după rol
    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter(
        (message) =>
          (message.sender && message.sender.role === filters.role) ||
          (message.receiver && message.receiver.role === filters.role)
      );
    }

    // Filtrare după interval de date
    if (filters.dateRange?.from) {
      filtered = filtered.filter((message) => {
        const messageDate = new Date(message.created_at);
        if (!filters.dateRange?.to) {
          return messageDate >= filters.dateRange.from;
        }
        return (
          messageDate >= filters.dateRange.from &&
          messageDate <= addDays(filters.dateRange.to, 1)
        );
      });
    }

    setFilteredMessages(filtered);
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
        <h2 className="text-2xl font-bold">Managementul Mesajelor</h2>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Caută în conținutul mesajului..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Caută după expeditor..."
            value={filters.sender}
            onChange={(e) =>
              setFilters({ ...filters, sender: e.target.value })
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Caută după destinatar..."
            value={filters.receiver}
            onChange={(e) =>
              setFilters({ ...filters, receiver: e.target.value })
            }
            className="max-w-sm"
          />
          <Select
            value={filters.role}
            onValueChange={(value) =>
              setFilters({ ...filters, role: value })
            }
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Filtrează după rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate rolurile</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="professional">Meșter</SelectItem>
            </SelectContent>
          </Select>
          <div className="bg-black/80 rounded-md">
            <DatePickerWithRange
              onChange={(dateRange) =>
                setFilters({ ...filters, dateRange })
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Doar necitite</span>
          <Switch
            checked={showUnreadOnly}
            onCheckedChange={setShowUnreadOnly}
          />
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nu există mesaje care să corespundă criteriilor de filtrare.
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
            {filteredMessages.map((message) => (
              <TableRow key={message.id} className={!message.read ? "bg-muted/50" : undefined}>
                <TableCell>
                  {message.sender.first_name} {message.sender.last_name}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {message.sender.email}
                  </span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {message.sender.county}, {message.sender.city}
                  </span>
                </TableCell>
                <TableCell>
                  {message.receiver.first_name} {message.receiver.last_name}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {message.receiver.email}
                  </span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {message.receiver.county}, {message.receiver.city}
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
