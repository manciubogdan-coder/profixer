import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Bell, Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Acasă
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Link to="/profile/client">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost">Deconectare</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Autentificare</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};