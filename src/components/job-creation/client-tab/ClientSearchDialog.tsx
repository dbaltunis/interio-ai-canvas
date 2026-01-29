
import { Plus, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  email?: string;
  company_name?: string;
  client_type?: string;
  phone?: string;
}

interface ClientSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onClientSelect: (clientId: string) => void;
  onCreateNew: () => void;
}

export const ClientSearchDialog = ({
  open,
  onOpenChange,
  clients,
  searchTerm,
  onSearchTermChange,
  onClientSelect,
  onCreateNew
}: ClientSearchDialogProps) => {
  const term = searchTerm.toLowerCase().trim();

  // Filter and sort clients with improved algorithm
  const filteredClients = term
    ? clients
        .filter(client => 
          client.name.toLowerCase().includes(term) ||
          client.company_name?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term)
        )
        .sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aStarts = aName.startsWith(term);
          const bStarts = bName.startsWith(term);
          
          // Prioritize startsWith matches
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Then alphabetical
          return aName.localeCompare(bName);
        })
    : clients
        .slice()
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        .slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
          <DialogDescription>
            Search and select a client from your database
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Command className="border rounded-lg">
            <CommandInput
              placeholder="Search clients..."
              value={searchTerm}
              onValueChange={onSearchTermChange}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No clients found.</CommandEmpty>
              <CommandGroup heading={term ? "Search Results" : "Recent Clients (A-Z)"}>
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => onClientSelect(client.id)}
                    className="cursor-pointer py-3"
                  >
                    <div className="flex items-start space-x-3 w-full">
                      {client.client_type === "B2B" ? (
                        <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{client.name}</span>
                          <Badge variant="outline" className="text-xs py-0">
                            {client.client_type === "B2B" ? "B2B" : "B2C"}
                          </Badge>
                        </div>
                        {client.company_name && (
                          <p className="text-sm text-muted-foreground">{client.company_name}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {client.email && <span className="truncate">{client.email}</span>}
                          {client.phone && <span>{client.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <Button onClick={onCreateNew} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create New Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
