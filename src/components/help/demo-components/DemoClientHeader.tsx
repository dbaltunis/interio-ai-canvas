/**
 * DemoClientHeader - Presentation-only version extracted from ClientManagementPage header
 * 100% visual accuracy with no data dependencies
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, Plus } from "lucide-react";

interface DemoClientHeaderProps {
  totalClients?: number;
  searchValue?: string;
  searchActive?: boolean;
  filterActive?: boolean;
  newButtonHighlight?: boolean;
}

export const DemoClientHeader = ({
  totalClients = 127,
  searchValue = "",
  searchActive = false,
  filterActive = false,
  newButtonHighlight = false,
}: DemoClientHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/50">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold">Clients</span>
        <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-medium rounded">
          {totalClients}
        </span>
      </div>
      
      <div className="flex items-center gap-1.5">
        {/* Compact search */}
        <motion.div 
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] ${
            searchActive ? "bg-background border border-primary w-24" : "bg-muted w-8 justify-center"
          }`}
        >
          <Search className={`h-3.5 w-3.5 ${searchActive ? "text-primary" : "text-muted-foreground"}`} />
          {searchActive && <span className="truncate">{searchValue || "..."}</span>}
        </motion.div>
        
        {/* Filter */}
        <motion.div 
          className={`p-1.5 rounded-lg ${filterActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
          animate={filterActive ? { scale: 1.05 } : { scale: 1 }}
        >
          <Filter className="h-3.5 w-3.5" />
        </motion.div>
        
        {/* New Client */}
        <motion.div 
          className={`flex items-center gap-1 px-2 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium ${newButtonHighlight ? "ring-2 ring-primary/50 ring-offset-1" : ""}`}
          animate={newButtonHighlight ? { scale: 1.05 } : { scale: 1 }}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </motion.div>
      </div>
    </div>
  );
};
