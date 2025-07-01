
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewClient {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
}

interface ClientCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newClient: NewClient;
  onClientChange: (client: NewClient) => void;
  onCreateClient: () => void;
}

export const ClientCreateDialog = ({
  open,
  onOpenChange,
  newClient,
  onClientChange,
  onCreateClient
}: ClientCreateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Add a new client to your database
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={newClient.name}
              onChange={(e) => onClientChange({...newClient, name: e.target.value})}
              placeholder="Client name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newClient.email}
              onChange={(e) => onClientChange({...newClient, email: e.target.value})}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={newClient.phone}
              onChange={(e) => onClientChange({...newClient, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={newClient.address}
              onChange={(e) => onClientChange({...newClient, address: e.target.value})}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newClient.city}
                onChange={(e) => onClientChange({...newClient, city: e.target.value})}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newClient.state}
                onChange={(e) => onClientChange({...newClient, state: e.target.value})}
                placeholder="State"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={newClient.zip_code}
              onChange={(e) => onClientChange({...newClient, zip_code: e.target.value})}
              placeholder="ZIP Code"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newClient.notes}
              onChange={(e) => onClientChange({...newClient, notes: e.target.value})}
              placeholder="Additional notes about the client"
              rows={3}
            />
          </div>
          <Button onClick={onCreateClient} className="w-full" disabled={!newClient.name}>
            Create Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
