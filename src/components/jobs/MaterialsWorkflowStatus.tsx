import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { useMaterialQueue } from "@/hooks/useMaterialQueue";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MaterialsWorkflowStatusProps {
  projectId: string;
}

export const MaterialsWorkflowStatus = ({ projectId }: MaterialsWorkflowStatusProps) => {
  const navigate = useNavigate();
  const { data: queueItems } = useMaterialQueue({ status: 'pending' });
  
  const projectQueueItems = queueItems?.filter(item => item.project_id === projectId) || [];
  const hasPendingMaterials = projectQueueItems.length > 0;
  
  if (!hasPendingMaterials) {
    return null;
  }
  
  const toOrder = projectQueueItems.filter(item => item.metadata?.source_type === 'order_from_supplier').length;
  const toAllocate = projectQueueItems.filter(item => item.metadata?.source_type === 'allocate_from_stock').length;
  
  return (
    <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Materials in Purchasing Queue</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                {projectQueueItems.length} item{projectQueueItems.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {toOrder > 0 && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{toOrder} to order from suppliers</span>
                </div>
              )}
              {toAllocate > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{toAllocate} to allocate from stock</span>
                </div>
              )}
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/?tab=ordering-hub')}
              className="mt-2 p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Go to Purchasing Hub →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};