
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface QuotationTabProps {
  projectId: string;
}

export const QuotationTab = ({ projectId }: QuotationTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Quotation</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Quote
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Generated Quotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">No quotation generated yet</h3>
            <p className="text-gray-500 mb-4">
              Add rooms and treatments first, then generate a professional quotation automatically.
            </p>
            <Button disabled>
              <FileText className="h-4 w-4 mr-2" />
              Generate Quotation (Add treatments first)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
