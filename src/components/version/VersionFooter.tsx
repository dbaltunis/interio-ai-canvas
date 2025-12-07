import { APP_VERSION, APP_BUILD_DATE, getFullVersion } from "@/constants/version";
import { useDebugModeOptional } from "@/contexts/DebugModeContext";
import { Bug } from "lucide-react";

export const VersionFooter = () => {
  const debugContext = useDebugModeOptional();
  const isDebugMode = debugContext?.isDebugMode || false;
  const toggleDebugMode = debugContext?.toggleDebugMode;

  return (
    <div className="fixed bottom-2 left-2 z-40 flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground/60 select-none">
        {getFullVersion()}
      </span>
      {toggleDebugMode && (
        <button
          onClick={toggleDebugMode}
          className={`p-1 rounded-full transition-colors ${
            isDebugMode 
              ? 'bg-yellow-500/20 text-yellow-600' 
              : 'text-muted-foreground/40 hover:text-muted-foreground/60'
          }`}
          title={isDebugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
        >
          <Bug className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
