
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DatabaseCheck = () => {
  const [user, setUser] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndDatabase();
  }, []);

  const checkAuthAndDatabase = async () => {
    try {
      // Check auth status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Auth check:", { user, authError });
      setUser(user);

      if (!user) {
        toast({
          title: "No User",
          description: "Please log in to test database access",
          variant: "destructive"
        });
        return;
      }

      // Test database access for key tables
      const tests = [
        { name: "business_settings", table: "business_settings" },
        { name: "inventory", table: "inventory" },
        { name: "team_members", table: "team_members" },
        { name: "vendors", table: "vendors" }
      ];

      const results: any = {};

      for (const test of tests) {
        try {
          const { data, error } = await supabase
            .from(test.table)
            .select("*")
            .limit(1);
          
          results[test.name] = {
            success: !error,
            error: error?.message,
            hasData: data && data.length > 0
          };
          console.log(`${test.name} test:`, { data, error });
        } catch (err) {
          results[test.name] = {
            success: false,
            error: err.message
          };
        }
      }

      setDbStatus(results);
      
      // Show summary
      const hasErrors = Object.values(results).some((r: any) => !r.success);
      if (hasErrors) {
        toast({
          title: "Database Issues Found",
          description: "Check console for details",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Database Access OK",
          description: "All tables accessible"
        });
      }
    } catch (error) {
      console.error("Database check failed:", error);
      toast({
        title: "Check Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Authentication Required</h3>
        <p className="text-yellow-700">Please log in to test database connectivity</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h3 className="font-semibold text-blue-800 mb-2">Database Status</h3>
      <p className="text-sm text-blue-700 mb-3">User: {user.email}</p>
      
      <div className="space-y-2">
        {Object.entries(dbStatus).map(([table, status]: [string, any]) => (
          <div key={table} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${status.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-medium">{table}</span>
            {status.error && <span className="text-red-600 text-sm">({status.error})</span>}
            {status.hasData && <span className="text-green-600 text-sm">(has data)</span>}
          </div>
        ))}
      </div>
      
      <button 
        onClick={checkAuthAndDatabase}
        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Recheck
      </button>
    </div>
  );
};
