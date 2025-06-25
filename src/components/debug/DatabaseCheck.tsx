
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
      const results: any = {};

      try {
        const { data: businessData, error: businessError } = await supabase
          .from("business_settings")
          .select("*")
          .limit(1);
        
        results.business_settings = {
          success: !businessError,
          error: businessError?.message,
          hasData: businessData && businessData.length > 0
        };
        console.log("business_settings test:", { data: businessData, error: businessError });
      } catch (err: any) {
        results.business_settings = {
          success: false,
          error: err.message
        };
      }

      try {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select("*")
          .limit(1);
        
        results.inventory = {
          success: !inventoryError,
          error: inventoryError?.message,
          hasData: inventoryData && inventoryData.length > 0
        };
        console.log("inventory test:", { data: inventoryData, error: inventoryError });
      } catch (err: any) {
        results.inventory = {
          success: false,
          error: err.message
        };
      }

      try {
        const { data: teamData, error: teamError } = await supabase
          .from("team_members")
          .select("*")
          .limit(1);
        
        results.team_members = {
          success: !teamError,
          error: teamError?.message,
          hasData: teamData && teamData.length > 0
        };
        console.log("team_members test:", { data: teamData, error: teamError });
      } catch (err: any) {
        results.team_members = {
          success: false,
          error: err.message
        };
      }

      try {
        const { data: vendorsData, error: vendorsError } = await supabase
          .from("vendors")
          .select("*")
          .limit(1);
        
        results.vendors = {
          success: !vendorsError,
          error: vendorsError?.message,
          hasData: vendorsData && vendorsData.length > 0
        };
        console.log("vendors test:", { data: vendorsData, error: vendorsError });
      } catch (err: any) {
        results.vendors = {
          success: false,
          error: err.message
        };
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
    } catch (error: any) {
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
