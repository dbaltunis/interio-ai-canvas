import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  useAccountSettings
} from "@/hooks/useAccountSettings";
import { useAccessRequests, useUpdateAccessRequest } from "@/hooks/useAccessRequests";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { AccessRequestsManager } from "../AccessRequestsManager";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Crown,
  Settings
} from "lucide-react";
import { useState } from "react";

export const AccountManagementTab = () => {
  return (
    <div className="space-y-6">
      <AccessRequestsManager />
    </div>
  );
};