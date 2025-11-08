import { DocumentBlock } from '../DocumentBuilderTab';

interface TableBlockProps {
  block: DocumentBlock;
}

export const TableBlock = ({ block }: TableBlockProps) => {
  const { content = {}, styles = {} } = block;
  
  const columns = content.columns || [
    { key: 'item', label: 'Item', align: 'left' },
    { key: 'quantity', label: 'Qty', align: 'center' },
    { key: 'price', label: 'Price', align: 'right' },
    { key: 'total', label: 'Total', align: 'right' },
  ];

  const rows = content.rows || [
    { item: 'Sample Product', quantity: 1, price: '$0.00', total: '$0.00' }
  ];

  return (
    <div style={styles} className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column: any) => (
              <th 
                key={column.key}
                className={`px-4 py-3 font-semibold text-gray-900 text-${column.align}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row: any, index: number) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column: any) => (
                <td 
                  key={column.key}
                  className={`px-4 py-3 text-gray-700 text-${column.align}`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {content.showTotals && (
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan={columns.length - 1} className="px-4 py-3 text-right font-semibold text-gray-900">
                Total:
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">
                {content.totalAmount || '$0.00'}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
