
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const TrimmingsSection = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <p className="text-brand-neutral">Trimmings management coming soon</p>
          <Button className="mt-4 bg-brand-primary hover:bg-brand-accent">
            <Plus className="h-4 w-4 mr-2" />
            Add First Trimming
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
