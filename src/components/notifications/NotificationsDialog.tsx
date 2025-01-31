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
import { Bell, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function NotificationsDialog() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      console.log("Fetching notifications for user:", user.id);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Nu am putut încărca notificările");
        return;
      }

      console.log("Fetched notifications:", data);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      toast.error("A apărut o eroare la încărcarea notificărilor");
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [user, open]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Notification change received:", payload);
          fetchNotifications(); // Refresh notifications when changes occur
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Nu am putut marca notificarea ca citită");
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error in markAsRead:", error);
      toast.error("A apărut o eroare la marcarea notificării");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        console.error("Error deleting notification:", error);
        toast.error("Nu am putut șterge notificarea");
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success("Notificarea a fost ștearsă");
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      toast.error("A apărut o eroare la ștergerea notificării");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100dvw] h-[100dvh] p-0 md:max-w-[800px] md:h-[80vh] md:max-h-[700px] md:p-6">
        <DialogHeader className="p-4 md:p-0">
          <DialogTitle>Notificări</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg ${
                  notification.read ? "bg-muted/50" : "bg-muted"
                } relative group`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}