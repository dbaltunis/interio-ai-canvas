import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const EmailDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI skeleton */}
      <div className="liquid-glass rounded-xl border p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg p-3 bg-muted/30">
              <div className="h-3 w-20 bg-muted rounded mb-2" />
              <div className="h-6 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters skeleton (compact chips) */}
      <div className="liquid-glass rounded-xl border p-3">
        <div className="flex flex-wrap gap-3">
          <div className="h-8 w-40 bg-muted/30 rounded" />
          <div className="h-8 w-36 bg-muted/30 rounded" />
          <div className="h-8 w-36 bg-muted/30 rounded" />
          <div className="h-8 w-36 bg-muted/30 rounded" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="liquid-glass rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-24 bg-muted rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, r) => (
              <TableRow key={r} className="hover:bg-muted/50">
                {Array.from({ length: 6 }).map((_, c) => (
                  <TableCell key={c}>
                    <div className="h-3 w-full bg-muted/30 rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmailDashboardSkeleton;
