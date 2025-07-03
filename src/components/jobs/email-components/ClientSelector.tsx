import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, Building2, Mail, Phone } from "lucide-react";
import { useClients } from "@/hooks/useClients";

interface ClientSelectorProps {
  selectedClients: any[];
  onSelectionChange: (clients: any[]) => void;
  maxSelection?: number;
}

export const ClientSelector = ({ selectedClients, onSelectionChange, maxSelection }: ClientSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clients = [] } = useClients();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientToggle = (client: any) => {
    const isSelected = selectedClients.some(c => c.id === client.id);
    
    if (isSelected) {
      onSelectionChange(selectedClients.filter(c => c.id !== client.id));
    } else {
      if (maxSelection && selectedClients.length >= maxSelection) {
        return; // Don't allow more selections
      }
      onSelectionChange([...selectedClients, client]);
    }
  };

  const selectAll = () => {
    if (maxSelection) {
      onSelectionChange(filteredClients.slice(0, maxSelection));
    } else {
      onSelectionChange(filteredClients);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <Users className="h-4 w-4 mr-2" />
          {selectedClients.length === 0 
            ? "Select Recipients" 
            : `${selectedClients.length} Client${selectedClients.length > 1 ? 's' : ''} Selected`
          }
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Email Recipients</DialogTitle>
          <DialogDescription>
            Choose clients from your CRM to send emails to
            {maxSelection && ` (Maximum ${maxSelection} recipients)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Actions */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          {/* Selected Clients Summary */}
          {selectedClients.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Selected:</span>
                  {selectedClients.map(client => (
                    <Badge 
                      key={client.id} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleClientToggle(client)}
                    >
                      {client.name} ✕
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clients Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const isSelected = selectedClients.some(c => c.id === client.id);
                  const isDisabled = maxSelection && !isSelected && selectedClients.length >= maxSelection;
                  
                  return (
                    <TableRow 
                      key={client.id} 
                      className={`cursor-pointer ${isSelected ? 'bg-blue-50' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                      onClick={() => !isDisabled && handleClientToggle(client)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && handleClientToggle(client)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {client.email || "No email"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {client.company_name && <Building2 className="h-4 w-4 text-gray-400" />}
                          {client.company_name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.client_type === 'B2B' ? 'default' : 'secondary'}>
                          {client.client_type || 'B2C'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {client.phone && <Phone className="h-4 w-4 text-gray-400" />}
                          {client.phone || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No clients found matching your search</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600">
              {selectedClients.length} of {filteredClients.length} clients selected
              {maxSelection && ` (max ${maxSelection})`}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};