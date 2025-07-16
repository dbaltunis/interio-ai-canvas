
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, AlertCircle, Construction } from "lucide-react";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";

export const MakingCostQuoteDemo = () => {
  const { windowCoverings, isLoading } = useWindowCoverings();

  if (isLoading) {
    return <div className="text-center py-8">Loading window coverings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="h-6 w-6 text-amber-600" />
            <div>
              <CardTitle className="text-amber-800">Making Cost Integration - Under Construction</CardTitle>
              <p className="text-sm text-amber-600">
                This feature is being migrated to the new Product Configuration system
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-amber-700 mb-2">Service Migration in Progress</h3>
            <p className="text-amber-600 mb-4">
              The Making Cost Integration service is being replaced by the new Product Configuration system.
            </p>
            <p className="text-sm text-amber-600">
              Please visit <strong>Settings → Products</strong> to configure making costs using the new system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
