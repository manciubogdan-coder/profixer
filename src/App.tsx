
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import { Users } from "./pages/admin/Users";
import { JobListings } from "./pages/admin/JobListings";
import { Messages } from "./pages/admin/Messages";
import { SubscriptionManagement } from "./pages/admin/SubscriptionManagement";
import { AdminNavbar } from "./components/admin/AdminNavbar";
import {
  HomeIcon,
  UsersIcon,
  ListChecks,
  MessageSquare,
  Settings,
  TicketIcon,
} from "lucide-react";
import SubscriptionActivate from "./pages/subscription/SubscriptionActivate";
import Checkout from "./pages/subscription/Checkout";
import SubscriptionSuccess from "./pages/subscription/SubscriptionSuccess";
import ActivateAllSubscriptions from './pages/admin/ActivateAllSubscriptions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "client" | "professional";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AdminRoutesConfig = [
  {
    path: "/admin",
    name: "Dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
    element: <Dashboard />,
  },
  {
    path: "/admin/users",
    name: "Utilizatori",
    icon: <UsersIcon className="h-5 w-5" />,
    element: <Users />,
  },
  {
    path: "/admin/job-listings",
    name: "Listări de Lucrări",
    icon: <ListChecks className="h-5 w-5" />,
    element: <JobListings />,
  },
  {
    path: "/admin/messages",
    name: "Mesaje",
    icon: <MessageSquare className="h-5 w-5" />,
    element: <Messages />,
  },
  {
    path: "/admin/subscriptions",
    name: "Abonamente",
    icon: <TicketIcon className="h-5 w-5" />,
    element: <SubscriptionManagement />,
  },
  {
    path: "/admin/settings",
    name: "Setări",
    icon: <Settings className="h-5 w-5" />,
    element: <div>Settings Component</div>,
  },
];

const AdminRoutes = () => {
  return (
    <>
      {AdminRoutesConfig.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/activate"
          element={
            <ProtectedRoute>
              <SubscriptionActivate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription/success"
          element={
            <ProtectedRoute>
              <SubscriptionSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Users />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/job-listings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <JobListings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Messages />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <SubscriptionManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <div>Settings Component</div>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activate-subscriptions"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <ActivateAllSubscriptions />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
