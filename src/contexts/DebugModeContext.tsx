import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CalculationLog {
  id: string;
  timestamp: Date;
  type: 'fullness' | 'fabric' | 'pricing' | 'option' | 'save' | 'load';
  source: string;
  details: Record<string, any>;
}

interface DebugModeContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  calculationLogs: CalculationLog[];
  addCalculationLog: (log: Omit<CalculationLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  showDataVerification: boolean;
  setShowDataVerification: (show: boolean) => void;
}

const DebugModeContext = createContext<DebugModeContextType | undefined>(undefined);

const DEBUG_MODE_KEY = 'interio_debug_mode';
const MAX_LOGS = 100;

export const DebugModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    try {
      return localStorage.getItem(DEBUG_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  
  const [calculationLogs, setCalculationLogs] = useState<CalculationLog[]>([]);
  const [showDataVerification, setShowDataVerification] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DEBUG_MODE_KEY, String(isDebugMode));
    } catch {
      // Ignore localStorage errors
    }
  }, [isDebugMode]);

  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
  };

  const addCalculationLog = (log: Omit<CalculationLog, 'id' | 'timestamp'>) => {
    if (!isDebugMode) return;
    
    const newLog: CalculationLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    setCalculationLogs(prev => {
      const updated = [newLog, ...prev];
      return updated.slice(0, MAX_LOGS);
    });
    
    // Also log to console for immediate visibility
    console.log(`🔍 [DEBUG ${log.type.toUpperCase()}] ${log.source}:`, log.details);
  };

  const clearLogs = () => {
    setCalculationLogs([]);
  };

  return (
    <DebugModeContext.Provider value={{
      isDebugMode,
      toggleDebugMode,
      calculationLogs,
      addCalculationLog,
      clearLogs,
      showDataVerification,
      setShowDataVerification,
    }}>
      {children}
    </DebugModeContext.Provider>
  );
};

export const useDebugMode = () => {
  const context = useContext(DebugModeContext);
  if (context === undefined) {
    throw new Error('useDebugMode must be used within a DebugModeProvider');
  }
  return context;
};

// Optional hook that doesn't throw if used outside provider (for utilities)
export const useDebugModeOptional = () => {
  const context = useContext(DebugModeContext);
  return context;
};
