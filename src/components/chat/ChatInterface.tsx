import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Paperclip, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageAttachment {
  name: string;
  url: string;
  type: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  attachments: MessageAttachment[];
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
  const [files, setFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const { data: recipientData, error: recipientError } = await supabase
          .from('user_profiles_with_email')
          .select('id')
          .eq('email', recipientId)
          .single();

        if (recipientError) throw recipientError;
        if (!recipientData?.id) {
          throw new Error('Recipient not found');
        }

        const { data, error } = await supabase
          .from("messages")
          .select(`
            *,
            sender:user_profiles_with_email!messages_sender_id_fkey(
              first_name, last_name, avatar_url
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${recipientData.id},receiver_id.eq.${recipientData.id}`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages = (data || []).map(message => ({
          ...message,
          sender: Array.isArray(message.sender) ? message.sender[0] : message.sender,
          attachments: Array.isArray(message.attachments) 
            ? message.attachments as MessageAttachment[]
            : []
        })) as Message[];

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Nu am putut încărca mesajele");
      }
    };

    fetchMessages();

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
          fetchMessages(); // Refresh messages when new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    const uploadedFiles = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);
        
      if (error) {
        console.error('Error uploading file:', error);
        toast.error(`Eroare la încărcarea fișierului ${file.name}`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);
        
      uploadedFiles.push({
        name: file.name,
        url: publicUrl,
        type: file.type
      });
    }
    
    return uploadedFiles;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newMessage.trim() && files.length === 0)) return;

    setIsLoading(true);
    try {
      const { data: recipientData, error: recipientError } = await supabase
        .from('user_profiles_with_email')
        .select('id')
        .eq('email', recipientId)
        .single();

      if (recipientError) throw recipientError;
      if (!recipientData?.id) {
        throw new Error('Recipient not found');
      }

      let uploadedFiles = [];
      if (files.length > 0) {
        uploadedFiles = await uploadFiles(files);
      }

      const { error } = await supabase.from("messages").insert([
        {
          sender_id: user.id,
          receiver_id: recipientData.id,
          content: newMessage.trim(),
          attachments: uploadedFiles
        },
      ]);

      if (error) throw error;

      setNewMessage("");
      setFiles([]);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Nu am putut trimite mesajul");
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <img 
          src={attachment.url} 
          alt={attachment.name} 
          className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
        />
      );
    }
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline flex items-center gap-2"
      >
        <Paperclip className="h-4 w-4" />
        {attachment.name}
      </a>
    );
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast.success("Mesaj șters cu succes");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Nu am putut șterge mesajul");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2 bg-background">
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
              <div className="group relative max-w-[75%] space-y-1">
                <div
                  className={`rounded-lg p-3 ${
                    message.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content && <p className="text-sm mb-2 break-words">{message.content}</p>}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="max-w-full">
                          {renderAttachment(attachment)}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-xs opacity-70">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-8 w-8 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Șterge mesajul
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t mt-auto bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => inputFileRef.current?.click()}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || (!newMessage.trim() && files.length === 0)}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <input
          type="file"
          ref={inputFileRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,video/*,application/*"
        />
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {files.map((file, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {file.name}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
