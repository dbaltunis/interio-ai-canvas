import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const JobsListSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-900 w-32">Job Number</TableHead>
            <TableHead className="font-semibold text-gray-900">Job Title</TableHead>
            <TableHead className="font-semibold text-gray-900">Client</TableHead>
            <TableHead className="font-semibold text-gray-900 w-24">Status</TableHead>
            <TableHead className="font-semibold text-gray-900 w-24">Priority</TableHead>
            <TableHead className="font-semibold text-gray-900 w-32">Value</TableHead>
            <TableHead className="font-semibold text-gray-900 w-32">Date Created</TableHead>
            <TableHead className="font-semibold text-gray-900 w-32">Due Date</TableHead>
            <TableHead className="font-semibold text-gray-900 w-20 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index} className="hover:bg-gray-50">
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex flex-col space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              
              <TableCell>
                <Skeleton className="h-6 w-14 rounded-full" />
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <Skeleton className="h-8 w-8 mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};