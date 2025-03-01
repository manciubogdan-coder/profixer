
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Search from "@/pages/Search";
import ClientProfile from "@/pages/profile/ClientProfile";
import CraftsmanPublicProfile from "@/pages/profile/CraftsmanPublicProfile";
import { AddJobListing } from "@/pages/jobs/AddJobListing";
import { EditJobListing } from "@/pages/jobs/EditJobListing";
import JobListings from "@/pages/jobs/JobListings";
import MyJobs from "@/pages/jobs/MyJobs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { Users } from "@/pages/admin/Users";
import { Messages } from "@/pages/admin/Messages";
import { SubscriptionManagement } from "@/pages/admin/SubscriptionManagement";
import ActivateSubscription from "@/pages/subscription/ActivateSubscription";
import Checkout from "@/pages/subscription/Checkout";
import SubscriptionSuccess from "@/pages/subscription/SubscriptionSuccess";
import { Privacy } from "@/pages/legal/Privacy";
import { Terms } from "@/pages/legal/Terms";
import { Cookies } from "@/pages/legal/Cookies";
import { GDPR } from "@/pages/legal/GDPR";
import { ANPC } from "@/pages/legal/ANPC";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile/me" element={<ClientProfile />} />
            <Route path="/profile/:id" element={<CraftsmanPublicProfile />} />
            <Route path="/jobs/add" element={<AddJobListing />} />
            <Route path="/jobs/edit/:id" element={<EditJobListing />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/jobs/my" element={<MyJobs />} />
            <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
            <Route path="/subscription/activate" element={<ActivateSubscription />} />
            <Route path="/subscription/checkout" element={<Checkout />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            
            {/* Static pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Legal routes */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/gdpr" element={<GDPR />} />
            <Route path="/anpc" element={<ANPC />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="users" element={<Users />} />
              <Route path="messages" element={<Messages />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
