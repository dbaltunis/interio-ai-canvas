import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePendingSubscriptionInvites, useResendCheckoutLink, PendingInvite } from "@/hooks/usePendingSubscriptionInvites";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { Copy, ExternalLink, RefreshCw, Mail, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function PendingInvitesSection() {
  const { data: invites, isLoading, refetch } = usePendingSubscriptionInvites();
  const resendMutation = useResendCheckoutLink();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Checkout link copied to clipboard.",
    });
  };

  const handleResend = async (invite: PendingInvite) => {
    setResendingEmail(invite.email);
    try {
      await resendMutation.mutateAsync({
        email: invite.email,
        planKey: invite.planName,
        seats: invite.seats,
      });
      refetch();
    } finally {
      setResendingEmail(null);
    }
  };

  const getStatusBadge = (invite: PendingInvite) => {
    if (invite.status === "complete" && invite.paymentStatus === "paid") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    
    if (invite.status === "expired" || isPast(new Date(invite.expiresAt))) {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    if (invite.paymentStatus === "unpaid") {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Incomplete
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  // Filter to show only non-completed invites by default
  const pendingInvites = invites?.filter(
    (i) => !(i.status === "complete" && i.paymentStatus === "paid")
  ) || [];
  
  const completedInvites = invites?.filter(
    (i) => i.status === "complete" && i.paymentStatus === "paid"
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading pending invites...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <CardTitle className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-5 w-5" />
                  Subscription Invites
                  {pendingInvites.length > 0 && (
                    <Badge variant="secondary">{pendingInvites.length} pending</Badge>
                  )}
                </CardTitle>
              </Button>
            </CollapsibleTrigger>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {pendingInvites.length === 0 && completedInvites.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No subscription invites found in the last 30 days.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Pending/Incomplete invites first */}
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.sessionId}
                    className="flex items-center justify-between border rounded-lg p-3 bg-muted/30"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invite.email}</span>
                        {getStatusBadge(invite)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3">
                        <span>
                          {invite.planName} • {invite.seats} seat{invite.seats > 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>
                          £{(invite.amount / 100).toFixed(0)}/{invite.currency.toUpperCase()}
                        </span>
                        <span>•</span>
                        <span>Sent {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite.checkoutUrl && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(invite.checkoutUrl!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={invite.checkoutUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleResend(invite)}
                        disabled={resendingEmail === invite.email}
                      >
                        {resendingEmail === invite.email ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Mail className="h-3 w-3 mr-1" />
                            Resend
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Recently completed invites (collapsed) */}
                {completedInvites.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Recently Completed ({completedInvites.length})
                    </p>
                    {completedInvites.slice(0, 3).map((invite) => (
                      <div
                        key={invite.sessionId}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{invite.email}</span>
                          <span className="text-muted-foreground">
                            • {invite.planName} • {format(new Date(invite.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <span className="text-green-600 font-medium">
                          £{(invite.amount / 100).toFixed(0)} paid
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
