import { MapPin } from "lucide-react";

interface CraftsmanMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export const CraftsmanMap = ({ latitude, longitude, address }: CraftsmanMapProps) => {
  if (!latitude || !longitude || !address) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <MapPin className="w-4 h-4" />
      <span>{address}</span>
    </div>
  );
};