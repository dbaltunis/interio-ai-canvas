/**
 * DemoClientCard - Presentation-only version extracted from MobileClientView.tsx
 * 100% visual accuracy with no data dependencies
 */

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Star, FolderKanban, Check } from "lucide-react";

export interface DemoClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  stage: "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "approved" | "lost" | "client";
  projects?: number;
  value?: string;
  isHotLead?: boolean;
}

interface DemoClientCardProps {
  client: DemoClientData;
  selected?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
}

// Exact color mapping from MobileClientView.tsx getStatusColor
const getStageColor = (stage: string) => {
  switch (stage?.toLowerCase()) {
    case 'lead':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'contacted':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'qualified':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'proposal':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'negotiation':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'approved':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'lost':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'client':
      return 'bg-primary/10 text-primary border-primary/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Exact avatar color logic from MobileClientView.tsx
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export const DemoClientCard = ({ 
  client, 
  selected = false, 
  highlighted = false,
  onClick 
}: DemoClientCardProps) => {
  const displayName = client.company || client.name;
  const initials = (displayName || 'U').substring(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(displayName || 'Unknown');
  const stageColor = getStageColor(client.stage);
  
  return (
    <motion.div
      animate={highlighted ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* EXACT JSX structure from MobileClientView.tsx lines 172-234 */}
      <Card 
        className={`overflow-hidden cursor-pointer hover:shadow-md transition-all rounded-xl border-border/40 bg-card ${
          selected ? 'ring-2 ring-primary' : ''
        } ${highlighted ? 'shadow-md' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox indicator */}
            {selected && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            
            {/* Colored Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-sm truncate">{displayName}</h4>
                    {client.isHotLead && (
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  {client.email && (
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs border ${stageColor}`}>
                  {client.stage.replace('_', ' ').toUpperCase()}
                </Badge>
                {client.value && client.value !== "$0" && (
                  <span className="text-xs font-medium text-muted-foreground">{client.value}</span>
                )}
                {client.projects && client.projects > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <FolderKanban className="h-3 w-3" />
                    {client.projects}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
