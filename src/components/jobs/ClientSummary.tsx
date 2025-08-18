import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Search, Calendar, FileText, DollarSign } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";
import { useClientEmails } from "@/hooks/useClientEmails";

interface ClientSummaryProps {
  client: any;
  onChangeClient: () => void;
  onRemoveClient: () => void;
}

export const ClientSummary = ({ client, onChangeClient, onRemoveClient }: ClientSummaryProps) => {
  const { data: projects = [] } = useProjects();
  const { data: quotes = [] } = useQuotes();
  const { data: clientEmails = [] } = useClientEmails(client?.id);

  if (!client) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <div className="bg-muted/50 p-3 rounded-full w-fit mx-auto mb-3">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No client assigned</p>
            <Button onClick={onChangeClient} size="sm" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const clientProjects = projects.filter(p => p.client_id === client.id);
  const clientQuotes = quotes.filter(q => q.client_id === client.id);
  
  const getClientDisplayName = (client: any) => {
    if (client.client_type === 'B2B' && client.company_name) {
      return client.company_name;
    }
    return client.name;
  };

  const handleEmailClient = () => {
    if (client.email) {
      window.open(`mailto:${client.email}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Client Header */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {getClientDisplayName(client)}
            </h3>
            {client.client_type === 'B2B' && client.contact_person && (
              <p className="text-sm text-muted-foreground">
                Contact: {client.contact_person}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {client.client_type || 'B2C'}
          </Badge>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">{client.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEmailClient}
                className="h-6 px-2"
              >
                <Mail className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.phone}</span>
            </div>
          )}
          
          {(client.address || client.city || client.state) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {[client.address, client.city, client.state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Mobile-Optimized Client Relationship Summary */}
        <div className="grid grid-cols-3 gap-3 py-4 border-t border-border">
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary">
              <FileText className="h-4 w-4" />
              <span className="font-semibold">{clientProjects.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Projects</p>
          </div>
          
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">{clientQuotes.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quotes</p>
          </div>
          
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">{clientEmails.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Emails</p>
          </div>
        </div>

        {/* Last Contact */}
        {client.last_contact_date && (
          <div className="text-center p-2 bg-muted/30 rounded text-xs">
            <span className="text-muted-foreground">Last contacted: </span>
            <span className="font-medium">
              {new Date(client.last_contact_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Mobile-Optimized Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onChangeClient}
            className="flex-1 h-11 touch-target"
          >
            <Search className="h-4 w-4 mr-2" />
            Change Client
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRemoveClient}
            className="flex-1 h-11 touch-target"
          >
            Remove Client
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};