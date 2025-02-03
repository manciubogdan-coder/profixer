import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Banknote, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { JobDetailsDialog } from "./JobDetailsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JobListingCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    county: string;
    city: string;
    budget?: number;
    start_date?: string;
    images?: string[];
    client: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
    trade: {
      name: string;
    };
  };
}

export function JobListingCard({ job }: JobListingCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <Badge variant="secondary" className="mt-2">
                {job.trade.name}
              </Badge>
            </div>
            <Avatar>
              <AvatarImage src={job.client.avatar_url} />
              <AvatarFallback>
                {job.client.first_name[0]}
                {job.client.last_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {job.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              {job.city}, {job.county}
            </div>
            {job.budget && (
              <div className="flex items-center text-sm">
                <Banknote className="w-4 h-4 mr-2 text-muted-foreground" />
                {job.budget} RON
              </div>
            )}
            {job.start_date && (
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                {format(new Date(job.start_date), "d MMMM yyyy", { locale: ro })}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setIsDetailsOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Vezi detalii
          </Button>
        </CardFooter>
      </Card>

      <JobDetailsDialog
        job={job}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
}