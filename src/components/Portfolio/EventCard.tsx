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
  return (
    <Link to={`/gallery/${id}`} className="block group">
      <Card className="overflow-hidden border-0 bg-card shadow-lg hover:shadow-elegant transition-all duration-500 group-hover:scale-[1.02]">
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
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-hover transition-colors duration-300">
              {title}
            </h3>
            
            {location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span className="text-sm">{location}</span>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-3">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;