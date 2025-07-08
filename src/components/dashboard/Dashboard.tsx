
import { EnhancedDashboard } from "./EnhancedDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CalendarDays, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Bell, 
  AlertTriangle, 
  Package, 
  Plus,
  Clock,
  Target,
  Zap,
  BarChart3,
  Mail,
  Eye,
  MousePointer,
  Send
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useEmailKPIs } from "@/hooks/useEmails";
import { KPICard } from "./KPICard";
import { RevenueChart } from "./RevenueChart";
import { QuickActions } from "./QuickActions";
import { PipelineOverview } from "./PipelineOverview";

export const Dashboard = () => {
  return <EnhancedDashboard />;
};
