import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface SupplierOrderConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName: string;
  itemCount: number;
  onConfirm: () => void;
}

export function SupplierOrderConfirmDialog({
  open,
  onOpenChange,
  supplierName,
  itemCount,
  onConfirm,
}: SupplierOrderConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Send Order to {supplierName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to order all {itemCount} {supplierName} supplied{" "}
            {itemCount === 1 ? "product" : "products"} in this job?
            <br />
            <span className="font-medium text-destructive mt-2 block">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Send Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
