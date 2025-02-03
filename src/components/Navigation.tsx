import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { NotificationsDialog } from "@/components/notifications/NotificationsDialog";
import { MessageSquare, Bell } from "lucide-react";

export default function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold">
            MesterulTau
          </Link>
          <Link to="/search" className="text-muted-foreground hover:text-foreground">
            Caută meșteri
          </Link>
          <Link to="/jobs" className="text-muted-foreground hover:text-foreground">
            Lucrări
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <ChatDialog>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </ChatDialog>
              <NotificationsDialog>
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
              </NotificationsDialog>
              <Button variant="ghost" onClick={signOut}>
                Deconectare
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Conectare</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}