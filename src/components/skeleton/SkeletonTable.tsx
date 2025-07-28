import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SkeletonTableProps {
  columns: string[];
  rows?: number;
  showActions?: boolean;
}

export const SkeletonTable = ({ columns, rows = 8, showActions = false }: SkeletonTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>{column}</TableHead>
          ))}
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton 
                  variant="text" 
                  className={`h-4 ${colIndex === 0 ? 'w-32' : 'w-24'}`} 
                />
              </TableCell>
            ))}
            {showActions && (
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};