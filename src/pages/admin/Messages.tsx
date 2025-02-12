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
import { MessageSquare, Trash2, CheckCircle, Search } from "lucide-react";
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
import { ro } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addDays } from "date-fns";

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
    county: "",
    city: "",
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

      setMessages(data || []);
    } catch (error) {
      console.error("Eroare la încărcarea mesajelor:", error);
      toast.error("Nu am putut încărca lista mesajelor");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Filtrare după text (căutare în conținut și nume)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (message) =>
          message.content.toLowerCase().includes(searchLower) ||
          `${message.sender.first_name} ${message.sender.last_name}`
            .toLowerCase()
            .includes(searchLower) ||
          `${message.receiver.first_name} ${message.receiver.last_name}`
            .toLowerCase()
            .includes(searchLower)
      );
    }

    // Filtrare după județ
    if (filters.county) {
      filtered = filtered.filter(
        (message) =>
          message.sender.county?.toLowerCase() === filters.county.toLowerCase() ||
          message.receiver.county?.toLowerCase() === filters.county.toLowerCase()
      );
    }

    // Filtrare după oraș
    if (filters.city) {
      filtered = filtered.filter(
        (message) =>
          message.sender.city?.toLowerCase() === filters.city.toLowerCase() ||
          message.receiver.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Filtrare după rol
    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter(
        (message) =>
          message.sender.role === filters.role ||
          message.receiver.role === filters.role
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Luna curentă</CardTitle>
            <CardDescription>Statistici pentru luna în curs</CardDescription>
          </CardHeader>
          <CardContent>
            {statistics[0] && (
              <div className="space-y-2">
                <p>Total mesaje: {statistics[0].total_messages}</p>
                <p>De la clienți: {statistics[0].messages_from_clients}</p>
                <p>De la meșteri: {statistics[0].messages_from_craftsmen}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Caută în mesaje..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filtrează după județ"
            value={filters.county}
            onChange={(e) =>
              setFilters({ ...filters, county: e.target.value })
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filtrează după oraș"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
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
          <DatePickerWithRange
            onChange={(dateRange) =>
              setFilters({ ...filters, dateRange })
            }
          />
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
