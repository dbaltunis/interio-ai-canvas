import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { useCreateDeal } from "@/hooks/useDeals";
import { useClients } from "@/hooks/useClients";
import { Search } from "lucide-react";

interface DealFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  preselectedClientId?: string;
}

export const DealForm = ({ onCancel, onSuccess, preselectedClientId }: DealFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [probability, setProbability] = useState("50");
  const [stage, setStage] = useState("qualification");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [source, setSource] = useState("");
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [clientSearch, setClientSearch] = useState("");

  const createDeal = useCreateDeal();
  const { data: clients } = useClients();

  const filteredClients = clients?.filter(client =>
    client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  ) || [];

  const selectedClient = clients?.find(c => c.id === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !title || !dealValue) {
      return;
    }

    try {
      await createDeal.mutateAsync({
        client_id: clientId,
        title,
        description,
        deal_value: parseFloat(dealValue),
        probability: parseInt(probability),
        stage,
        expected_close_date: expectedCloseDate || undefined,
        source: source || undefined,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create deal:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormFieldGroup label="Deal Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New curtains for office renovation"
              required
            />
          </FormFieldGroup>

          <FormFieldGroup label="Client" required>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div>
                  <div className="font-medium">
                    {selectedClient.client_type === 'B2B' ? selectedClient.company_name : selectedClient.name}
                  </div>
                  {selectedClient.email && (
                    <div className="text-sm text-muted-foreground">{selectedClient.email}</div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setClientId("")}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a client..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {clientSearch && (
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setClientId(client.id);
                          setClientSearch("");
                        }}
                      >
                        <div className="font-medium">
                          {client.client_type === 'B2B' ? client.company_name : client.name}
                        </div>
                        {client.email && (
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        )}
                      </div>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">
                        No clients found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </FormFieldGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldGroup label="Deal Value" required>
              <Input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </FormFieldGroup>

            <FormFieldGroup label="Probability" description="Likelihood of closing (%)">
              <Select value={probability} onValueChange={setProbability}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% - Very Low</SelectItem>
                  <SelectItem value="25">25% - Low</SelectItem>
                  <SelectItem value="50">50% - Medium</SelectItem>
                  <SelectItem value="75">75% - High</SelectItem>
                  <SelectItem value="90">90% - Very High</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldGroup>

            <FormFieldGroup label="Stage">
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="needs_analysis">Needs Analysis</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldGroup>

            <FormFieldGroup label="Expected Close Date">
              <Input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
              />
            </FormFieldGroup>
          </div>

          <FormFieldGroup label="Source" description="How was this opportunity identified?">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound">Inbound Lead</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="trade_show">Trade Show</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldGroup>

          <FormFieldGroup label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the opportunity, requirements, and next steps..."
            />
          </FormFieldGroup>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDeal.isPending || !clientId || !title || !dealValue}>
              {createDeal.isPending ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};