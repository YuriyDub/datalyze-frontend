import { IQueryResult } from '@/services/api/chat';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps {
  data: IQueryResult;
}

export function DataTable({ data }: DataTableProps) {
  if (!data.rows.length) {
    return <div className="text-center p-4">No data available</div>;
  }

  return (
    <div className="w-full overflow-auto max-h-96">
      <Table>
        <TableHeader>
          <TableRow>
            {data.columns.map((column) => (
              <TableHead key={column} className="whitespace-nowrap">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {data.columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`} className="whitespace-nowrap">
                  {formatCellValue(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  if (typeof value === 'number') {
    // Format numbers with up to 2 decimal places if they have decimals
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  
  return String(value);
}
