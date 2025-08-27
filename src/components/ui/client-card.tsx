import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  Star,
  MessageCircle,
  Edit,
  MoreHorizontal
} from 'lucide-react';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    avatar?: string;
    status?: 'active' | 'inactive' | 'lead';
    rating?: number;
    lastContact?: string;
    projectCount?: number;
    totalValue?: number;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onMessage?: () => void;
  className?: string;
}

export const ClientCard = ({ 
  client, 
  onClick, 
  onEdit, 
  onMessage, 
  className 
}: ClientCardProps) => {
  const statusConfig = {
    active: { color: 'bg-green-500/10 text-green-600 border-green-200', label: 'Active' },
    inactive: { color: 'bg-gray-500/10 text-gray-600 border-gray-200', label: 'Inactive' },
    lead: { color: 'bg-blue-500/10 text-blue-600 border-blue-200', label: 'Lead' }
  };

  const status = client.status ? statusConfig[client.status] : statusConfig.active;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.();
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer hover-lift group transition-all duration-300",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {client.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", status.color)}>
                  {status.label}
                </Badge>
                {client.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{client.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={handleMessage}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {client.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{client.company}</span>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{client.address}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {client.projectCount !== undefined && (
              <span>{client.projectCount} projects</span>
            )}
            {client.totalValue !== undefined && (
              <span>${client.totalValue.toLocaleString()}</span>
            )}
          </div>
          {client.lastContact && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(client.lastContact).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};