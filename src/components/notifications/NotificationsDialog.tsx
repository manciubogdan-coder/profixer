import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsDialogProps {
  children: React.ReactNode;
}

interface NotificationType {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  user_id: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export function NotificationsDialog({ children }: NotificationsDialogProps) {
  const { user } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:profiles(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      return data as NotificationType[];
    },
    enabled: !!user,
  });

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificări</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg ${
                    notification.read ? "bg-muted/50" : "bg-muted"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {notification.sender && (
                      <Avatar>
                        <AvatarImage src={notification.sender.avatar_url} />
                        <AvatarFallback>
                          {notification.sender.first_name[0]}
                          {notification.sender.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium leading-none">
                        {notification.title}
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "d MMMM yyyy, HH:mm", {
                          locale: ro,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nu aveți notificări
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}