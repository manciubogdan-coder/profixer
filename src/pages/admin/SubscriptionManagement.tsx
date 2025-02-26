
import { Card } from "@/components/ui/card";
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

      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Managementul Abonamentelor</h2>
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
      </Card>
    </div>
  );
};
