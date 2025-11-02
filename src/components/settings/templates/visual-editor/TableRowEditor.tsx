import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TableRow {
  id: string;
  [key: string]: any;
}

interface TableRowEditorProps {
  rows: TableRow[];
  columns: string[];
  onRowsChange: (rows: TableRow[]) => void;
  showImages?: boolean;
}

export const TableRowEditor = ({
  rows,
  columns,
  onRowsChange,
  showImages = false,
}: TableRowEditorProps) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);

  const handleCellEdit = (rowId: string, column: string, value: any) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId ? { ...row, [column]: value } : row
    );
    onRowsChange(updatedRows);
    setEditingCell(null);
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: `row_${Date.now()}`,
      ...columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {}),
    };
    onRowsChange([...rows, newRow]);
  };

  const handleDeleteRow = (rowId: string) => {
    onRowsChange(rows.filter((row) => row.id !== rowId));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="w-10"></th>
            {columns.map((column) => (
              <th key={column} className="p-2 text-left text-xs font-medium border">
                {column}
              </th>
            ))}
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="group hover:bg-muted/30">
              <td className="p-1 border">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 cursor-grab opacity-0 group-hover:opacity-100"
                >
                  <GripVertical className="h-3 w-3" />
                </Button>
              </td>
              {columns.map((column) => (
                <td key={column} className="p-1 border">
                  {editingCell?.rowId === row.id && editingCell?.column === column ? (
                    <Input
                      autoFocus
                      value={row[column] || ''}
                      onChange={(e) => handleCellEdit(row.id, column, e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingCell(null);
                        } else if (e.key === 'Tab') {
                          e.preventDefault();
                          const currentColIndex = columns.indexOf(column);
                          const nextCol = columns[currentColIndex + 1];
                          if (nextCol) {
                            setEditingCell({ rowId: row.id, column: nextCol });
                          } else if (rows[rowIndex + 1]) {
                            setEditingCell({ rowId: rows[rowIndex + 1].id, column: columns[0] });
                          }
                        }
                      }}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCell({ rowId: row.id, column })}
                      className="p-2 min-h-[32px] cursor-text hover:bg-muted/50 rounded"
                    >
                      {row[column] || <span className="text-muted-foreground">Click to edit</span>}
                    </div>
                  )}
                </td>
              ))}
              <td className="p-1 border">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={() => handleDeleteRow(row.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        size="sm"
        variant="outline"
        className="mt-2"
        onClick={handleAddRow}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Row
      </Button>
    </div>
  );
};
