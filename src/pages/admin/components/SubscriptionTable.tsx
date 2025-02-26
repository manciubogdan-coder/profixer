
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subscription {
  id: string;
  craftsman_id: string;
  craftsman_name: string;
  craftsman_email: string;
  status: "active" | "inactive";
  end_date: string | null;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onUpdateDate: (subscriptionId: string, newDate: Date) => void;
  loading: boolean;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  emailFilter: string;
  onEmailFilterChange: (value: string) => void;
}

export const SubscriptionTable = ({
  subscriptions,
  onUpdateDate,
  loading,
  statusFilter,
  onStatusFilterChange,
  nameFilter,
  onNameFilterChange,
  emailFilter,
  onEmailFilterChange,
}: SubscriptionTableProps) => {
  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Filtrează după nume..."
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Filtrează după email..."
            value={emailFilter}
            onChange={(e) => onEmailFilterChange(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrează după status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nume</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Expirării</TableHead>
            <TableHead>Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                {subscription.craftsman_name}
              </TableCell>
              <TableCell>{subscription.craftsman_email}</TableCell>
              <TableCell>
                <Badge 
                  variant={subscription.status === "active" ? "default" : "destructive"}
                >
                  {subscription.status === "active" ? "Activ" : "Inactiv"}
                </Badge>
              </TableCell>
              <TableCell>
                {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ro-RO') : 'Nesetat'}
              </TableCell>
              <TableCell>
                <DatePicker
                  date={subscription.end_date ? new Date(subscription.end_date) : undefined}
                  setDate={(date) => {
                    if (date) {
                      onUpdateDate(subscription.craftsman_id, date);
                    }
                  }}
                >
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Selectează data expirării
                  </Button>
                </DatePicker>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
