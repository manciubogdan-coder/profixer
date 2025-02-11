
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Settings, Users } from "lucide-react";

export const AdminNavbar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: Settings
    },
    {
      title: "Utilizatori",
      path: "/admin/users",
      icon: Users
    }
  ];
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 h-16">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
