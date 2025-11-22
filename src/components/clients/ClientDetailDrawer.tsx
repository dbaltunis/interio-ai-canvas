import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Building2, User, File, Info } from "lucide-react";
import { ClientFilesManager } from "./ClientFilesManager";
import { useAuth } from "@/components/auth/AuthProvider";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  client_type?: string;
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  state?: string;
  funnel_stage?: string;
  notes?: string;
}

interface ClientDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export const ClientDetailDrawer = ({ open, onOpenChange, client }: ClientDetailDrawerProps) => {
  const { user } = useAuth();

  if (!client) return null;

  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
  const initials = (displayName || 'U').substring(0, 2).toUpperCase();

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'lead':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-purple-100 text-purple-700';
      case 'qualified':
        return 'bg-green-100 text-green-700';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-700';
      case 'client':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-2xl">{displayName}</SheetTitle>
              {client.client_type === 'B2B' && client.contact_person && (
                <p className="text-sm text-muted-foreground mt-1">{client.contact_person}</p>
              )}
              <Badge className={`${getStageColor(client.funnel_stage || 'lead')} mt-2`}>
                {(client.funnel_stage || 'lead').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              <Info className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="files">
              <File className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{client.phone}</p>
                  </div>
                </div>
              )}

              {(client.address || client.city || client.state) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">
                      {[client.address, client.city, client.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {client.client_type === 'B2B' ? (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{client.client_type || 'B2C'}</p>
                </div>
              </div>

              {client.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            {user && (
              <ClientFilesManager clientId={client.id} userId={user.id} />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
