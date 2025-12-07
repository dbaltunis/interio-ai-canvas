import { useState } from "react";
import { useDebugMode } from "@/contexts/DebugModeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Bug, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  RefreshCw,
  X,
  Calculator,
  Database,
  Palette,
  Save
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const typeIcons = {
  fullness: Calculator,
  fabric: Palette,
  pricing: Calculator,
  option: Palette,
  save: Save,
  load: Database,
};

const typeColors = {
  fullness: "bg-blue-500/10 text-blue-700 border-blue-200",
  fabric: "bg-green-500/10 text-green-700 border-green-200",
  pricing: "bg-purple-500/10 text-purple-700 border-purple-200",
  option: "bg-orange-500/10 text-orange-700 border-orange-200",
  save: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  load: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
};

export const DebugPanel = () => {
  const { isDebugMode, calculationLogs, clearLogs, toggleDebugMode } = useDebugMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const queryClient = useQueryClient();

  if (!isDebugMode) return null;

  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing all data...');
    
    // Clear all queries and refetch
    await queryClient.invalidateQueries();
    
    // Force a page state update
    window.dispatchEvent(new CustomEvent('force-data-refresh'));
  };

  const handleHardRefresh = () => {
    // Clear caches and reload
    try {
      localStorage.removeItem('INTERIO_APP_CACHE');
      sessionStorage.clear();
    } catch {
      // Ignore errors
    }
    window.location.reload();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="bg-yellow-500/20 border-yellow-500 text-yellow-700 hover:bg-yellow-500/30"
        >
          <Bug className="h-4 w-4 mr-1" />
          Debug ({calculationLogs.length})
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[500px] shadow-lg border-yellow-500/50 bg-background/95 backdrop-blur">
      <CardHeader className="py-2 px-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bug className="h-4 w-4 text-yellow-600" />
          Debug Mode
          <Badge variant="outline" className="text-xs">
            {calculationLogs.length} logs
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleForceRefresh}
            title="Force Refresh Data"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearLogs}
            title="Clear Logs"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleDebugMode}
            title="Close Debug Mode"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 px-3 space-y-2">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleForceRefresh}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleHardRefresh}
          >
            <Database className="h-3 w-3 mr-1" />
            Hard Reload
          </Button>
        </div>

        {/* Calculation Logs */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
              Calculation Logs
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-64 mt-2">
              {calculationLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No calculation logs yet. Interact with the app to see debug info.
                </p>
              ) : (
                <div className="space-y-2">
                  {calculationLogs.map((log) => {
                    const Icon = typeIcons[log.type] || Calculator;
                    const colorClass = typeColors[log.type] || "bg-gray-500/10 text-gray-700";
                    
                    return (
                      <div
                        key={log.id}
                        className={`p-2 rounded-md border text-xs ${colorClass}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-3 w-3" />
                          <span className="font-medium">{log.type.toUpperCase()}</span>
                          <span className="text-muted-foreground">
                            {format(log.timestamp, 'HH:mm:ss')}
                          </span>
                        </div>
                        <div className="text-muted-foreground mb-1">{log.source}</div>
                        <pre className="text-[10px] bg-background/50 p-1 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
