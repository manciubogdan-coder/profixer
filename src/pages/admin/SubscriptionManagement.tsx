
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DashboardStats } from "./components/DashboardStats";
import { SubscriptionTable } from "./components/SubscriptionTable";
import { useSubscriptions } from "./hooks/useSubscriptions";

export const SubscriptionManagement = () => {
  const { 
    subscriptions, 
    stats, 
    loading, 
    updateSubscriptionDate,
    filters,
    setFilters
  } = useSubscriptions();

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
              placeholder="Caută global..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="max-w-sm"
            />
          </div>

          <SubscriptionTable
            subscriptions={subscriptions}
            onUpdateDate={updateSubscriptionDate}
            loading={loading}
            statusFilter={filters.status}
            onStatusFilterChange={(status) => 
              setFilters(prev => ({ ...prev, status: status as "all" | "active" | "inactive" }))}
            nameFilter={filters.name}
            onNameFilterChange={(name) => 
              setFilters(prev => ({ ...prev, name }))}
            emailFilter={filters.email}
            onEmailFilterChange={(email) => 
              setFilters(prev => ({ ...prev, email }))}
          />
        </div>
      </div>
    </div>
  );
};
