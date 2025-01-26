import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Search from "@/pages/Search";
import ClientProfile from "@/pages/profile/ClientProfile";
import CraftsmanPublicProfile from "@/pages/profile/CraftsmanPublicProfile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<ClientProfile />} />
          <Route path="/profile/:id" element={<CraftsmanPublicProfile />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;