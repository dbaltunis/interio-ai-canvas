import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountWithDetails } from "@/types/subscriptions";
import { AccountInfoPanel } from "./AccountInfoPanel";
import { SubscriptionPanel } from "./SubscriptionPanel";

interface AccountDetailsDialogProps {
  account: AccountWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailsDialog({ account, open, onOpenChange }: AccountDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Details - {account.display_name || account.email}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Account Info</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <AccountInfoPanel account={account} />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <SubscriptionPanel account={account} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
