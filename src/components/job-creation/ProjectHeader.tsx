
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  onBack: () => void;
}

export const ProjectHeader = ({ projectName, onBack }: ProjectHeaderProps) => {
  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-xl font-semibold">{projectName}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select defaultValue="payment">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="quote">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="order">Order</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
