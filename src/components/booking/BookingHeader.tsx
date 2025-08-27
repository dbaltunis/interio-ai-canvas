import { Clock, Mail } from "lucide-react";

interface BookingHeaderProps {
  scheduler: {
    name: string;
    description?: string;
    image_url?: string;
    duration: number;
    user_email?: string;
  };
}

export const BookingHeader = ({ scheduler }: BookingHeaderProps) => {
  return (
    <div className="text-center mb-8">
      {scheduler.image_url && (
        <img 
          src={scheduler.image_url} 
          alt="Profile"
          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
        />
      )}
      <h1 className="text-3xl font-bold text-foreground mb-2">{scheduler.name}</h1>
      {scheduler.description && (
        <p className="text-muted-foreground max-w-2xl mx-auto">{scheduler.description}</p>
      )}
      <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {scheduler.duration} minutes
        </div>
        {scheduler.user_email && (
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {scheduler.user_email}
          </div>
        )}
      </div>
    </div>
  );
};