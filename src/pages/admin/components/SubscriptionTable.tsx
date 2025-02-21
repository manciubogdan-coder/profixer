
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
}

export const SubscriptionTable = ({
  subscriptions,
  onUpdateDate,
  loading,
}: SubscriptionTableProps) => {
  if (loading) {
    return <div>Se încarcă...</div>;
  }

  return (
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
                    onUpdateDate(subscription.id, date);
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
  );
};
