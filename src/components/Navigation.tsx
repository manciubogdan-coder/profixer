import { Bell, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="bg-secondary py-4 px-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          ProFixer
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/search" className="text-white hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/notifications" className="text-white hover:text-primary transition-colors">
            <Bell className="h-5 w-5" />
          </Link>
          <Link to="/profile" className="text-white hover:text-primary transition-colors">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
};