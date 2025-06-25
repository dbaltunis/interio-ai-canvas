
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const SetupHelper = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createStorageBuckets = async () => {
    setLoading(true);
    try {
      // Try to create buckets (will fail if they already exist, which is fine)
      const buckets = [
        { id: 'fabric-images', name: 'fabric-images', public: true },
        { id: 'project-documents', name: 'project-documents', public: true },
        { id: 'project-images', name: 'project-images', public: true }
      ];

      for (const bucket of buckets) {
        const { error } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public
        });
        
        if (error && !error.message.includes('already exists')) {
          console.error(`Failed to create bucket ${bucket.id}:`, error);
        } else {
          console.log(`Bucket ${bucket.id} ready`);
        }
      }

      toast({
        title: "Storage Setup",
        description: "Storage buckets are ready",
      });
    } catch (error: any) {
      console.error("Storage setup error:", error);
      toast({
        title: "Storage Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseAccess = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Test basic operations
      const tests = [
        // Test inventory
        async () => {
          const { error } = await supabase.from('inventory').select('*').limit(1);
          return { table: 'inventory', success: !error, error };
        },
        // Test vendors
        async () => {
          const { error } = await supabase.from('vendors').select('*').limit(1);
          return { table: 'vendors', success: !error, error };
        },
        // Test business_settings
        async () => {
          const { error } = await supabase.from('business_settings').select('*').limit(1);
          return { table: 'business_settings', success: !error, error };
        }
      ];

      const results = await Promise.all(tests.map(test => test()));
      console.log("Database test results:", results);

      const failedTests = results.filter(r => !r.success);
      if (failedTests.length > 0) {
        throw new Error(`Failed tests: ${failedTests.map(t => t.table).join(', ')}`);
      }

      toast({
        title: "Database Access",
        description: "All database tables accessible",
      });
    } catch (error: any) {
      console.error("Database test error:", error);
      toast({
        title: "Database Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Setup Helper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={createStorageBuckets}
            disabled={loading}
            variant="outline"
          >
            Setup Storage
          </Button>
          <Button 
            onClick={testDatabaseAccess}
            disabled={loading}
            variant="outline"
          >
            Test Database
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Use these buttons to ensure storage buckets are created and database access is working.
        </p>
      </CardContent>
    </Card>
  );
};
