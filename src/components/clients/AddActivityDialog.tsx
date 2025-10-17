import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateActivity, ActivityType } from "@/hooks/useClientActivity";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface AddActivityDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddActivityDialog = ({ clientId, open, onOpenChange }: AddActivityDialogProps) => {
  const createActivity = useCreateActivity();
  const [activityType, setActivityType] = useState<ActivityType>("note_added");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [valueAmount, setValueAmount] = useState("");
  const [teamMember, setTeamMember] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    await createActivity.mutateAsync({
      client_id: clientId,
      activity_type: activityType,
      title: title.trim(),
      description: description.trim() || undefined,
      value_amount: valueAmount ? parseFloat(valueAmount) : undefined,
      team_member: teamMember.trim() || undefined,
      follow_up_date: followUpDate ? format(followUpDate, "yyyy-MM-dd") : undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setValueAmount("");
    setTeamMember("");
    setFollowUpDate(undefined);
    setActivityType("note_added");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Activity Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="activity-type">Activity Type</Label>
            <Select value={activityType} onValueChange={(value) => setActivityType(value as ActivityType)}>
              <SelectTrigger id="activity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note_added">General Note</SelectItem>
                <SelectItem value="call_made">Phone Call</SelectItem>
                <SelectItem value="meeting_held">Meeting</SelectItem>
                <SelectItem value="email_sent">Email Sent</SelectItem>
                <SelectItem value="quote_created">Quote Created</SelectItem>
                <SelectItem value="project_started">Project Started</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Called about project timeline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-member">Team Member</Label>
              <Input
                id="team-member"
                placeholder="Your name"
                value={teamMember}
                onChange={(e) => setTeamMember(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value-amount">Value ($)</Label>
              <Input
                id="value-amount"
                type="number"
                placeholder="0.00"
                value={valueAmount}
                onChange={(e) => setValueAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Follow-up Date (Optional)</Label>
            <Popover modal={false}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {followUpDate ? format(followUpDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                <Calendar
                  mode="single"
                  selected={followUpDate}
                  onSelect={setFollowUpDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || createActivity.isPending}>
            {createActivity.isPending ? "Saving..." : "Save Activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
