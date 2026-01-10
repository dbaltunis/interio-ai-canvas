import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountWithDetails } from "@/types/subscriptions";
import { AccountInfoPanel } from "./AccountInfoPanel";
import { SubscriptionPanel } from "./SubscriptionPanel";
import { CustomInvoicesPanel } from "./CustomInvoicesPanel";

interface AccountDetailsDialogProps {
  account: AccountWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailsDialog({ account, open, onOpenChange }: AccountDetailsDialogProps) {
  const handleAccountDeleted = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Details - {account.display_name || account.email}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Account Info</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="invoices">Custom Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <AccountInfoPanel account={account} onAccountDeleted={handleAccountDeleted} />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <SubscriptionPanel account={account} />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <CustomInvoicesPanel userId={account.user_id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
