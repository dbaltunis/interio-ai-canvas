
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const MakingCostsManager = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-800">Making Costs (Legacy)</CardTitle>
              <CardDescription className="text-blue-600">
                This legacy system has been replaced by the new Product Configuration system
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
              DEPRECATED
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-blue-700 mb-4">
              Please use the new <strong>Products</strong> tab in Settings for configuring making costs and product types.
            </p>
            <p className="text-sm text-blue-600">
              The new system provides better organization and more flexible pricing options.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
