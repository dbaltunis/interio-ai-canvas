import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { Badge } from "@/components/ui/badge";
import { useCreateEmailSequence } from "@/hooks/useMarketing";
import { Plus, X, Mail } from "lucide-react";

interface EmailSequenceFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export const EmailSequenceForm = ({ onCancel, onSuccess }: EmailSequenceFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("lead_created");
  const [steps, setSteps] = useState([
    { step_number: 1, delay_days: 0, delay_hours: 0, subject: "", content: "" }
  ]);

  const createSequence = useCreateEmailSequence();

  const addStep = () => {
    setSteps([...steps, {
      step_number: steps.length + 1,
      delay_days: 1,
      delay_hours: 0,
      subject: "",
      content: ""
    }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        step_number: i + 1
      })));
    }
  };

  const updateStep = (index: number, field: string, value: any) => {
    setSteps(steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || steps.some(step => !step.subject || !step.content)) {
      return;
    }

    try {
      await createSequence.mutateAsync({
        name,
        description,
        trigger_type: triggerType,
        steps
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create email sequence:", error);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'lead_created': 'When a new lead is created',
      'stage_change': 'When lead stage changes',
      'time_based': 'On a schedule',
      'manual': 'Manually triggered',
      'behavior': 'Based on behavior'
    };
    return labels[trigger] || trigger;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Create Email Sequence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldGroup label="Sequence Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., New Lead Welcome Series"
                required
              />
            </FormFieldGroup>

            <FormFieldGroup label="Trigger">
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_created">New Lead Created</SelectItem>
                  <SelectItem value="stage_change">Stage Change</SelectItem>
                  <SelectItem value="time_based">Time-Based</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="behavior">Behavior Triggered</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldGroup>
          </div>

          <FormFieldGroup label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe the purpose of this email sequence..."
            />
          </FormFieldGroup>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Email Steps</h3>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {getTriggerLabel(triggerType)}
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Step {step.step_number}
                        {index > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {step.delay_days > 0 ? `${step.delay_days} days` : 'Immediate'}
                          </Badge>
                        )}
                      </CardTitle>
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {index > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormFieldGroup label="Delay (Days)">
                          <Input
                            type="number"
                            min="0"
                            value={step.delay_days}
                            onChange={(e) => updateStep(index, 'delay_days', parseInt(e.target.value) || 0)}
                          />
                        </FormFieldGroup>
                        <FormFieldGroup label="Delay (Hours)">
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={step.delay_hours}
                            onChange={(e) => updateStep(index, 'delay_hours', parseInt(e.target.value) || 0)}
                          />
                        </FormFieldGroup>
                      </div>
                    )}

                    <FormFieldGroup label="Email Subject" required>
                      <Input
                        value={step.subject}
                        onChange={(e) => updateStep(index, 'subject', e.target.value)}
                        placeholder="Enter email subject line"
                        required
                      />
                    </FormFieldGroup>

                    <FormFieldGroup label="Email Content" required>
                      <Textarea
                        value={step.content}
                        onChange={(e) => updateStep(index, 'content', e.target.value)}
                        rows={6}
                        placeholder="Write your email content here..."
                        required
                      />
                    </FormFieldGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSequence.isPending}>
              {createSequence.isPending ? "Creating..." : "Create Sequence"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};