import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Calendar, FileText, Building } from "lucide-react";
import { useSMSContacts } from "@/hooks/useSMSContacts";
import { useSMSTemplates } from "@/hooks/useSMSTemplates";
import { 
  useSendSMSNotification, 
  useSendAppointmentReminder, 
  useSendQuoteNotification, 
  useSendProjectNotification 
} from "@/hooks/useSMSNotifications";

export const SMSNotifications = () => {
  const [selectedType, setSelectedType] = useState("manual");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notificationType, setNotificationType] = useState("");

  const { data: contacts } = useSMSContacts();
  const { data: templates } = useSMSTemplates();
  const sendSMS = useSendSMSNotification();
  const sendAppointmentReminder = useSendAppointmentReminder();
  const sendQuoteNotification = useSendQuoteNotification();
  const sendProjectNotification = useSendProjectNotification();

  const optedInContacts = contacts?.filter(c => c.opted_in) || [];

  const handleSendManualSMS = async () => {
    if (!phoneNumber || !customMessage) return;
    
    await sendSMS.mutateAsync({
      phoneNumber,
      message: customMessage,
      templateId: selectedTemplate || undefined,
    });
    
    // Reset form
    setPhoneNumber("");
    setCustomMessage("");
    setSelectedTemplate("");
  };

  const handleSendAppointmentReminder = async () => {
    if (!appointmentId || !phoneNumber) return;
    
    await sendAppointmentReminder.mutateAsync({
      appointmentId,
      phoneNumber,
      customMessage: customMessage || undefined,
    });
    
    // Reset form
    setAppointmentId("");
    setPhoneNumber("");
    setCustomMessage("");
  };

  const handleSendQuoteNotification = async () => {
    if (!quoteId || !phoneNumber || !notificationType) return;
    
    await sendQuoteNotification.mutateAsync({
      quoteId,
      phoneNumber,
      notificationType: notificationType as any,
    });
    
    // Reset form
    setQuoteId("");
    setPhoneNumber("");
    setNotificationType("");
  };

  const handleSendProjectNotification = async () => {
    if (!projectId || !phoneNumber || !notificationType) return;
    
    await sendProjectNotification.mutateAsync({
      projectId,
      phoneNumber,
      updateType: notificationType as any,
      customMessage: customMessage || undefined,
    });
    
    // Reset form
    setProjectId("");
    setPhoneNumber("");
    setNotificationType("");
    setCustomMessage("");
  };

  const isLoading = sendSMS.isPending || 
    sendAppointmentReminder.isPending || 
    sendQuoteNotification.isPending || 
    sendProjectNotification.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">SMS Notifications</h2>
        <p className="text-muted-foreground">
          Send automated and manual SMS notifications to your clients
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optedInContacts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Templates</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Send SMS Notification</CardTitle>
          <CardDescription>
            Choose the type of notification you want to send
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card 
              className={`cursor-pointer transition-colors ${
                selectedType === 'manual' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType('manual')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle className="text-base">Manual SMS</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedType === 'appointment' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType('appointment')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle className="text-base">Appointment</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedType === 'quote' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType('quote')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle className="text-base">Quote</CardTitle>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedType === 'project' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedType('project')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <CardTitle className="text-base">Project</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Manual SMS Form */}
          {selectedType === 'manual' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Select value={phoneNumber} onValueChange={setPhoneNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact or enter phone" />
                    </SelectTrigger>
                    <SelectContent>
                      {optedInContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.phone_number}>
                          {contact.name || contact.phone_number} - {contact.phone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {customMessage.length} characters
                </p>
              </div>

              <Button 
                onClick={handleSendManualSMS}
                disabled={isLoading || !phoneNumber || !customMessage}
              >
                <Send className="mr-2 h-4 w-4" />
                Send SMS
              </Button>
            </div>
          )}

          {/* Appointment Reminder Form */}
          {selectedType === 'appointment' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="appointment-id">Appointment ID</Label>
                  <Input
                    id="appointment-id"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    placeholder="Enter appointment ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Select value={phoneNumber} onValueChange={setPhoneNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {optedInContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.phone_number}>
                          {contact.name || contact.phone_number} - {contact.phone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Leave blank to use default appointment reminder message"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSendAppointmentReminder}
                disabled={isLoading || !appointmentId || !phoneNumber}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Appointment Reminder
              </Button>
            </div>
          )}

          {/* Quote Notification Form */}
          {selectedType === 'quote' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="quote-id">Quote ID</Label>
                  <Input
                    id="quote-id"
                    value={quoteId}
                    onChange={(e) => setQuoteId(e.target.value)}
                    placeholder="Enter quote ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Select value={phoneNumber} onValueChange={setPhoneNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {optedInContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.phone_number}>
                          {contact.name || contact.phone_number} - {contact.phone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notification-type">Notification Type</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Quote Created</SelectItem>
                      <SelectItem value="updated">Quote Updated</SelectItem>
                      <SelectItem value="approved">Quote Approved</SelectItem>
                      <SelectItem value="expired">Quote Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSendQuoteNotification}
                disabled={isLoading || !quoteId || !phoneNumber || !notificationType}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Quote Notification
              </Button>
            </div>
          )}

          {/* Project Notification Form */}
          {selectedType === 'project' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="project-id">Project ID</Label>
                  <Input
                    id="project-id"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter project ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Select value={phoneNumber} onValueChange={setPhoneNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {optedInContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.phone_number}>
                          {contact.name || contact.phone_number} - {contact.phone_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="update-type">Update Type</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="started">Project Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Project Completed</SelectItem>
                      <SelectItem value="delayed">Project Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Leave blank to use default project update message"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSendProjectNotification}
                disabled={isLoading || !projectId || !phoneNumber || !notificationType}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Project Update
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};