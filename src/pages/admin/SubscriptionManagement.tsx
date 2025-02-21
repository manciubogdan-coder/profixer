
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DashboardStats } from "./components/DashboardStats";
import { SubscriptionTable } from "./components/SubscriptionTable";
import { useSubscriptions } from "./hooks/useSubscriptions";

export const SubscriptionManagement = () => {
  const { subscriptions, stats, loading, updateSubscriptionDate } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubscriptions = subscriptions
    .filter(sub =>
      sub.craftsman_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.craftsman_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(sub => 
      statusFilter === "all" ? true : sub.status === statusFilter
    );

  return (
    <div className="space-y-6 p-6">
      <DashboardStats {...stats} />

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Managementul Abonamentelor</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gestionează abonamentele meșterilor
          </p>

          <div className="flex items-center mb-6">
            <Search className="w-5 h-5 text-muted-foreground mr-2" />
            <Input
              placeholder="Caută după nume sau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            onUpdateDate={updateSubscriptionDate}
            loading={loading}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>
    </div>
  );
};
