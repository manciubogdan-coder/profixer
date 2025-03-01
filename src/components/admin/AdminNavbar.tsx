import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  Users,
  TicketIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const AdminNavbar = () => {
  const navigationLinks = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Utilizatori",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Abonamente",
      href: "/admin/subscriptions",
      icon: <TicketIcon className="h-5 w-5" />,
    },
    {
      name: "Activare Abonamente",
      href: "/admin/activate-subscriptions",
      icon: <TicketIcon className="h-5 w-5" />,
    },
    {
      name: "Setări",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-100 border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-lg font-semibold">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navigationLinks.map((link) => (
            <li key={link.name} className="mb-2">
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 ${
                    isActive ? "bg-gray-200 font-medium" : ""
                  }`
                }
              >
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
