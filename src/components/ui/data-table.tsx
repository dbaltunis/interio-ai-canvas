import React from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any, index: number) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (row: any, index: number) => void;
  emptyMessage?: string;
  className?: string;
  variant?: 'default' | 'modern' | 'minimal';
}

export const DataTable = ({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
  className,
  variant = 'modern'
}: DataTableProps) => {
  const tableVariants = {
    default: {
      table: "w-full border-collapse",
      header: "bg-muted/50",
      headerCell: "px-4 py-3 text-left text-sm font-medium text-muted-foreground border-b border-border",
      row: "hover:bg-muted/30 transition-colors",
      cell: "px-4 py-3 text-sm border-b border-border/50"
    },
    modern: {
      table: "w-full border-collapse",
      header: "bg-gradient-to-r from-muted/30 to-muted/10",
      headerCell: "px-6 py-4 text-left text-sm font-semibold text-foreground border-b border-border",
      row: "hover:bg-muted/20 hover:shadow-sm transition-all duration-200 cursor-pointer",
      cell: "px-6 py-4 text-sm border-b border-border/30"
    },
    minimal: {
      table: "w-full",
      header: "",
      headerCell: "px-3 py-2 text-left text-xs font-medium text-muted-foreground",
      row: "hover:bg-muted/20 transition-colors",
      cell: "px-3 py-2 text-sm"
    }
  };

  const styles = tableVariants[variant];

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-muted/20 rounded-lg inline-block mb-3">
          <div className="h-8 w-8 rounded bg-muted" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg", className)}>
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead className={styles.header}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(styles.headerCell, column.className)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(styles.row, onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(row, index)}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td
                      key={column.key}
                      className={cn(styles.cell, column.className)}
                    >
                      {column.render
                        ? column.render(value, row, index)
                        : value || '-'
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};