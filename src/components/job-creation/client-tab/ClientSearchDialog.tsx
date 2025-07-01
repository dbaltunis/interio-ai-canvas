
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface Client {
  id: string;
  name: string;
  email?: string;
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
            <CommandList className="max-h-[200px]">
              <CommandEmpty>No clients found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => onClientSelect(client.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      {client.email && (
                        <span className="text-sm text-muted-foreground">{client.email}</span>
                      )}
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
