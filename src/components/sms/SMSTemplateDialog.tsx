import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { useCreateSMSTemplate, useUpdateSMSTemplate } from "@/hooks/useSMSTemplates";

interface SMSTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
}

const TEMPLATE_TYPES = [
  { value: 'appointment', label: 'Appointment' },
  { value: 'quote', label: 'Quote' },
  { value: 'project', label: 'Project' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'follow_up', label: 'Follow-up' },
];

const COMMON_VARIABLES = {
  appointment: ['client_name', 'appointment_date', 'appointment_time', 'location', 'appointment_title'],
  quote: ['client_name', 'quote_number', 'total_amount', 'valid_until'],
  project: ['client_name', 'project_name', 'status', 'completion_date'],
  marketing: ['client_name', 'offer_details', 'expiry_date'],
  reminder: ['client_name', 'reminder_text', 'due_date'],
  follow_up: ['client_name', 'service_type', 'completion_date'],
};

export const SMSTemplateDialog = ({ open, onOpenChange, template }: SMSTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [templateType, setTemplateType] = useState("appointment");
  const [variables, setVariables] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [newVariable, setNewVariable] = useState("");
  
  const createTemplate = useCreateSMSTemplate();
  const updateTemplate = useUpdateSMSTemplate();

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setMessage(template.message);
      setTemplateType(template.template_type);
      setVariables(template.variables || []);
      setActive(template.active);
    } else {
      setName("");
      setMessage("");
      setTemplateType("appointment");
      setVariables([]);
      setActive(true);
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      name,
      message,
      template_type: templateType,
      variables,
      active,
    };

    try {
      if (isEditing) {
        await updateTemplate.mutateAsync({
          id: template.id,
          updates: templateData,
        });
      } else {
        await createTemplate.mutateAsync(templateData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const addVariable = (variable: string) => {
    if (variable && !variables.includes(variable)) {
      setVariables([...variables, variable]);
    }
  };

  const addCustomVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim())) {
      setVariables([...variables, newVariable.trim()]);
      setNewVariable("");
    }
  };

  const removeVariable = (variableToRemove: string) => {
    setVariables(variables.filter(variable => variable !== variableToRemove));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + `{${variable}}` + message.substring(end);
      setMessage(newMessage);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
  };

  const characterCount = message.length;
  const smsSegments = Math.ceil(characterCount / 160);
  const commonVars = COMMON_VARIABLES[templateType as keyof typeof COMMON_VARIABLES] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit SMS Template' : 'Create SMS Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Template Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter template name..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="template-type">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your SMS template here..."
                  rows={6}
                  required
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{characterCount} characters</span>
                  <span>{smsSegments} SMS segment{smsSegments !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Active Template</Label>
                  <p className="text-sm text-gray-500">
                    Active templates can be used for automated messages
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
            </div>

            {/* Right Column - Variables */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Variables</CardTitle>
                  <CardDescription>
                    Add variables to personalize your messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Common Variables */}
                  <div>
                    <Label className="text-sm font-medium">Common Variables for {templateType}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonVars.map((variable) => (
                        <Button
                          key={variable}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVariable(variable)}
                          disabled={variables.includes(variable)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {variable}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Variable Input */}
                  <div>
                    <Label className="text-sm font-medium">Add Custom Variable</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newVariable}
                        onChange={(e) => setNewVariable(e.target.value)}
                        placeholder="custom_variable"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={addCustomVariable}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Selected Variables */}
                  {variables.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Selected Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {variables.map((variable, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => insertVariable(variable)}
                              className="hover:underline"
                            >
                              {variable}
                            </button>
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeVariable(variable)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Click a variable to insert it into your message
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                      {message || "Your message will appear here..."}
                    </div>
                  </div>
                  {variables.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Variables like {variables.map(v => `{${v}}`).join(', ')} will be replaced with actual values when sent
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTemplate.isPending || updateTemplate.isPending || !message.trim()}
            >
              {isEditing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};