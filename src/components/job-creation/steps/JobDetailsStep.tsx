
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface JobDetailsStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const JobDetailsStep = ({ formData, updateFormData }: JobDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-900">
          Job Title *
        </Label>
        <Input
          id="title"
          value={formData.title || ""}
          onChange={(e) => updateFormData("title", e.target.value)}
          placeholder="Enter job title"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status" className="text-sm font-medium text-gray-900">
            Status
          </Label>
          <Select 
            value={formData.status || "draft"} 
            onValueChange={(value) => updateFormData("status", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority" className="text-sm font-medium text-gray-900">
            Priority
          </Label>
          <Select 
            value={formData.priority || "medium"} 
            onValueChange={(value) => updateFormData("priority", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date" className="text-sm font-medium text-gray-900">
            Start Date
          </Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date || ""}
            onChange={(e) => updateFormData("start_date", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="due_date" className="text-sm font-medium text-gray-900">
            Due Date
          </Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date || ""}
            onChange={(e) => updateFormData("due_date", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-900">
          Project Description
        </Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Describe the project requirements, scope, and any special considerations..."
          className="mt-1"
          rows={4}
        />
      </div>
    </div>
  );
};
