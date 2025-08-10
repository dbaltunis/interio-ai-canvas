import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const JobsTableSkeleton = () => {
  return (
    <div className="liquid-glass rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Job Number</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Emails</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Client</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Status</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Total</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Owner</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};