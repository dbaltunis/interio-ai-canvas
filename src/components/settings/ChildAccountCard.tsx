import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, User, Calendar, Building2, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ChildAccount {
  user_id: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  account_settings: {
    account_name: string;
    industry?: string;
    created_at: string;
  };
}

interface ChildAccountCardProps {
  account: ChildAccount;
}

export const ChildAccountCard = ({ account }: ChildAccountCardProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleManageAccount = () => {
    navigate(`/settings/accounts/${account.user_id}`);
  };

  const handleRemoveAccount = async () => {
    setIsRemoving(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_active: false })
        .eq("user_id", account.user_id);

      if (error) throw error;

      toast({
        title: "Account removed",
        description: `${account.display_name} has been deactivated.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["child-accounts"] });
      setShowRemoveDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{account.display_name}</h4>
                  <Badge 
                    variant={account.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {account.role}
                  </Badge>
                  {!account.is_active && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {account.account_settings.account_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                  </div>
                </div>

                {account.account_settings.industry && (
                  <div className="text-xs text-muted-foreground">
                    Industry: {account.account_settings.industry}
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleManageAccount}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowRemoveDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {account.display_name}? This will deactivate their account and they will no longer have access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAccount}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
