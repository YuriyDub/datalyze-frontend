import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataType, TableDefinition } from './DataUploadDialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const TableView = ({
  table,
  isEditing,
  columnTypeChange,
  columnNameChange,
}: {
  table: TableDefinition;
  isEditing: boolean;
  columnTypeChange: (columnIndex: number, value: DataType) => void;
  columnNameChange: (index: number, value: string) => void;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs md:text-sm">Column Name</TableHead>
          <TableHead className="text-xs md:text-sm">Column Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.columns.map((column, columnIndex) => (
          <TableRow key={columnIndex}>
            <TableCell>
              {isEditing ? (
                <Input
                  value={column.name}
                  onChange={(e) => columnNameChange(columnIndex, e.target.value)}
                />
              ) : (
                column.name
              )}
            </TableCell>
            <TableCell>
              {isEditing ? (
                <Select
                  value={column.type}
                  onValueChange={(value) => columnTypeChange(columnIndex, value as DataType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">{column.originalType}</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
