import { Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Search from "@/pages/Search";
import Jobs from "@/pages/Jobs";
import CraftsmanPublicProfile from "@/pages/profile/CraftsmanPublicProfile";
import ClientProfile from "@/pages/profile/ClientProfile";

export default function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/search" element={<Search />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/profile/craftsman/:id" element={<CraftsmanPublicProfile />} />
        <Route path="/profile/client/:id" element={<ClientProfile />} />
      </Routes>
    </>
  );
}