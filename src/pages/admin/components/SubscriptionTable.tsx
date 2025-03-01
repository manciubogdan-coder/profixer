
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Check,
  ChevronDown,
  Edit,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isValid } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  onUpdateDate: (subscriptionId: string, newDate: Date) => Promise<void>;
  loading: boolean;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (status: string) => void;
  nameFilter: string;
  onNameFilterChange: (name: string) => void;
  emailFilter: string;
  onEmailFilterChange: (email: string) => void;
  onActivateAll?: () => Promise<void>;
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
  onActivateAll,
}: SubscriptionTableProps) => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      onNameFilterChange("");
      onEmailFilterChange("");
    }
  };

  const applySearch = () => {
    if (search.includes("@")) {
      onEmailFilterChange(search);
      onNameFilterChange("");
    } else {
      onNameFilterChange(search);
      onEmailFilterChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applySearch();
    }
  };

  const handleEditDate = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    const currentEndDate = subscription.end_date ? new Date(subscription.end_date) : undefined;
    setSelectedDate(currentEndDate);
    setIsDatePickerOpen(true);
  };

  const handleSaveDate = async () => {
    if (selectedSubscription && selectedDate && isValid(selectedDate)) {
      setIsUpdating(true);
      try {
        await onUpdateDate(selectedSubscription.craftsman_id, selectedDate);
        setIsDatePickerOpen(false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleActivateAll = async () => {
    if (onActivateAll) {
      try {
        await onActivateAll();
      } catch (error) {
        console.error("Error activating all subscriptions:", error);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume sau email..."
              className="pl-8 w-64"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button variant="outline" size="sm" onClick={applySearch}>
            Caută
          </Button>
        </div>

        <div className="flex gap-3 items-center">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {onActivateAll && (
            <Button onClick={handleActivateAll}>
              Activează toate abonamentele
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nu există abonamente care să corespundă criteriilor.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume meșter</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dată expirare</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.craftsman_name}</TableCell>
                  <TableCell>{sub.craftsman_email}</TableCell>
                  <TableCell>
                    {sub.status === "active" ? (
                      <span className="flex items-center gap-1.5 text-green-600">
                        <Check className="h-4 w-4" />
                        Activ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600">
                        <X className="h-4 w-4" />
                        Inactiv
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.end_date ? format(new Date(sub.end_date), "dd MMM yyyy") : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditDate(sub)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editează data expirării
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifică data expirării</DialogTitle>
            <DialogDescription>
              Alege noua dată de expirare pentru abonamentul lui{" "}
              {selectedSubscription?.craftsman_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Selectează data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDatePickerOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveDate} disabled={isUpdating || !selectedDate}>
              {isUpdating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
