import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  eventType: string;
  location?: string;
  heroImage: string;
  description: string;
}

const EventCard = ({ id, title, eventType, location, heroImage, description }: EventCardProps) => {
  // Limit description to maintain card height consistency
  const truncatedDescription = description.length > 120 
    ? description.substring(0, 120) + "..." 
    : description;

  return (
    <Link to={`/gallery/${id}`} className="block group h-full">
      <Card className="overflow-hidden border-0 bg-card shadow-lg hover:shadow-elegant transition-all duration-500 group-hover:scale-[1.02] h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={heroImage} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-background/90 text-foreground hover:bg-background/80 backdrop-blur-sm">
              <Calendar className="mr-1 h-3 w-3" />
              {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <CardContent className="p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <h3 className="font-bold line-clamp-2 group-hover:text-hover transition-colors duration-300">
              {title}
            </h3>
            
            {location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span className="text-sm">{location}</span>
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {truncatedDescription}
            </p>
            <div className="pt-2 border-t border-border/50">
              <span className="text-primary text-sm font-medium hover:underline transition-all duration-300">
                View Gallery →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;