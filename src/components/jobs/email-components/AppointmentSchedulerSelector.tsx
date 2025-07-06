
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Copy, Link, Clock, MapPin, Video, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";

interface AppointmentSchedulerSelectorProps {
  onSchedulerSelect: (schedulerLink: string, schedulerName: string) => void;
  onEmbedCode: (embedCode: string, schedulerName: string) => void;
}

export const AppointmentSchedulerSelector = ({ 
  onSchedulerSelect, 
  onEmbedCode 
}: AppointmentSchedulerSelectorProps) => {
  const { toast } = useToast();
  const { data: schedulers } = useAppointmentSchedulers();
  const [selectedScheduler, setSelectedScheduler] = useState<string>("");
  const [embedType, setEmbedType] = useState<"link" | "button" | "card">("button");
  const [previewOpen, setPreviewOpen] = useState(false);

  const generateSchedulerSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const generateBookingLink = (scheduler: any) => {
    const baseUrl = window.location.origin;
    const slug = generateSchedulerSlug(scheduler.name);
    return `${baseUrl}/book/${slug}`;
  };

  const generateEmbedCode = (scheduler: any) => {
    const bookingUrl = generateBookingLink(scheduler);
    const locations = (scheduler.locations as any) || {};

    switch (embedType) {
      case "link":
        return `<a href="${bookingUrl}" target="_blank">${scheduler.name}</a>`;
      
      case "button":
        return `<a href="${bookingUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 0;">📅 Book ${scheduler.name}</a>`;
      
      case "card":
        const locationBadges = [];
        if (locations.inPerson?.enabled) locationBadges.push('📍 In-Person');
        if (locations.googleMeet?.enabled) locationBadges.push('💻 Google Meet');
        if (locations.zoom?.enabled) locationBadges.push('💻 Zoom');
        if (locations.phone?.enabled) locationBadges.push('📞 Phone');

        return `
<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; max-width: 400px; font-family: Arial, sans-serif; margin: 20px 0;">
  ${scheduler.image_url ? `<img src="${scheduler.image_url}" alt="${scheduler.name}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 15px; object-fit: cover;">` : ''}
  <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${scheduler.name}</h3>
  <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">${scheduler.description || 'Schedule your appointment'}</p>
  <div style="margin-bottom: 15px;">
    <span style="display: inline-block; padding: 4px 8px; background-color: #f3f4f6; color: #374151; border-radius: 4px; font-size: 12px; margin-right: 8px;">
      ⏰ ${scheduler.duration} minutes
    </span>
    ${locationBadges.map(badge => `<span style="display: inline-block; padding: 4px 8px; background-color: #f3f4f6; color: #374151; border-radius: 4px; font-size: 12px; margin-right: 4px; margin-bottom: 4px;">${badge}</span>`).join('')}
  </div>
  <a href="${bookingUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; width: 100%; text-align: center; box-sizing: border-box;">
    📅 Schedule Now
  </a>
</div>`;
      
      default:
        return bookingUrl;
    }
  };

  const handleInsertLink = () => {
    const scheduler = schedulers?.find(s => s.id === selectedScheduler);
    if (!scheduler) return;

    const bookingLink = generateBookingLink(scheduler);
    onSchedulerSelect(bookingLink, scheduler.name);
    
    toast({
      title: "Booking Link Added",
      description: `${scheduler.name} booking link has been added to your email`
    });
  };

  const handleInsertEmbed = () => {
    const scheduler = schedulers?.find(s => s.id === selectedScheduler);
    if (!scheduler) return;

    const embedCode = generateEmbedCode(scheduler);
    onEmbedCode(embedCode, scheduler.name);
    
    toast({
      title: "Scheduler Embedded",
      description: `${scheduler.name} has been embedded in your email`
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    });
  };

  if (!schedulers || schedulers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h4 className="font-medium text-gray-900 mb-2">No Schedulers Available</h4>
          <p className="text-sm text-gray-500 mb-4">Create appointment schedulers to embed booking links in your emails</p>
          <Button size="sm" onClick={() => window.open('/calendar', '_blank')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Scheduler
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Appointment Schedulers
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add booking links for your appointment schedulers
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Scheduler</label>
          <Select value={selectedScheduler} onValueChange={setSelectedScheduler}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a scheduler..." />
            </SelectTrigger>
            <SelectContent>
              {schedulers.map((scheduler) => {
                const locations = (scheduler.locations as any) || {};
                return (
                  <SelectItem key={scheduler.id} value={scheduler.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{scheduler.name}</div>
                        <div className="text-xs text-gray-500">
                          {scheduler.duration}min • 
                          {locations.inPerson?.enabled && ' In-Person'}
                          {locations.googleMeet?.enabled && ' Google Meet'}
                          {locations.zoom?.enabled && ' Zoom'}
                          {locations.phone?.enabled && ' Phone'}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedScheduler && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Embed Style</label>
              <Select value={embedType} onValueChange={(value: "link" | "button" | "card") => setEmbedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Simple Link</SelectItem>
                  <SelectItem value="button">Styled Button</SelectItem>
                  <SelectItem value="card">Full Scheduler Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleInsertLink}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <Link className="h-4 w-4 mr-2" />
                Insert Link
              </Button>
              
              <Button 
                onClick={handleInsertEmbed}
                size="sm"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Embed Scheduler
              </Button>

              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Scheduler Preview</DialogTitle>
                    <DialogDescription>
                      This is how your scheduler will appear in the email
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded border">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: generateEmbedCode(schedulers.find(s => s.id === selectedScheduler)) 
                        }} 
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(generateEmbedCode(schedulers.find(s => s.id === selectedScheduler)))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy HTML
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
