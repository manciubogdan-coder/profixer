import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Search from "@/pages/Search";
import ClientProfile from "@/pages/profile/ClientProfile";
import CraftsmanPublicProfile from "@/pages/profile/CraftsmanPublicProfile";
import { AddJobListing } from "@/pages/jobs/AddJobListing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
            <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;