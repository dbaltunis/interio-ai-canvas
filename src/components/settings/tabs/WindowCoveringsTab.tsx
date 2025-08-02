import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurtainTemplatesManager } from "./products/CurtainTemplatesManager";

export const WindowCoveringsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Coverings Management</CardTitle>
          <CardDescription>
            Manage your curtain templates and window covering configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurtainTemplatesManager />
        </CardContent>
      </Card>
    </div>
  );
};