import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import {
  jsonToSqlite,
  csvToSqlite,
  uploadSqlite,
  clearTempFiles,
  IColumnDefinition as ApiColumnDefinition,
  IJsonToSqliteOptions,
  ICsvToSqliteOptions,
} from '@/services/api/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { TableView } from './TableView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PencilLine } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { renameFile } from '../utils';

export type DataType = 'string' | 'number' | 'boolean' | 'date';

// Map frontend data types to SQLite types
const mapDataTypeToSqliteType = (
  dataType: DataType,
): 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'NULL' => {
  switch (dataType) {
    case 'string':
      return 'TEXT';
    case 'number':
      return 'INTEGER';
    case 'boolean':
      return 'INTEGER';
    case 'date':
      return 'TEXT';
    default:
      return 'TEXT';
  }
};

export interface ColumnDefinition {
  name: string;
  type: DataType;
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
}

export type DataSourceType = 'csv' | 'json' | 'sqlite';

type SampleData = Record<string, string | number | boolean | Date | null | undefined>;

enum Steps {
  Name,
  Type,
  Upload,
  Configure,
  Review,
  Processing,
}

const steps = [
  { id: Steps.Name, label: 'Name', description: 'Set data name' },
  { id: Steps.Type, label: 'Select Type', description: 'Choose data source' },
  { id: Steps.Upload, label: 'Upload', description: 'Select your file' },
  { id: Steps.Configure, label: 'Configure', description: 'Set up structure' },
  { id: Steps.Review, label: 'Review', description: 'Confirm import' },
  { id: Steps.Processing, label: 'Processing', description: 'Converting data' },
];

export function DataUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeStep, setActiveStep] = useState(Steps.Name);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const [csvHasHeaders, setCsvHasHeaders] = useState(true);
  const [tables, setTables] = useState<TableDefinition[]>([]);
  const [dataSourceType, setDataSourceType] = useState<DataSourceType | ''>('');
  const [dataName, setDataName] = useState('');
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setDataSourceType('');
      setFile(null);
      setTables([]);
      setColumnNames([]);
      setError(null);
    }
  }, [open]);

  const handleNext = () => {
    if (dataSourceType !== 'csv' && csvHasHeaders) {
      setCsvHasHeaders(false);
    }
    if (activeStep === Steps.Name && dataName.length < 3) {
      setError('Please fill name with at least 3 characters');
      return;
    }
    if (activeStep === Steps.Type && !dataSourceType) {
      setError('Please select a data source type');
      return;
    }
    if (activeStep === Steps.Upload && !file) {
      setError('Please select a file to upload');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const detectColumnTypes = useCallback((data: SampleData[]): DataType[] => {
    if (!data || data.length === 0) return [];

    const sample = data[0];
    return Object.keys(sample).map((key) => {
      const value = sample[key];

      if (value === null || value === undefined || value === '') {
        return 'string';
      }

      if (typeof value === 'boolean') return 'boolean';
      if (value === 'true' || value === 'false') return 'boolean';

      if (!isNaN(Number(value))) return 'number';

      if (value instanceof Date) return 'date';
      if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';

      return 'string';
    });
  }, []);

  const processFile = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      if (dataSourceType === 'csv') {
        const text = await file.text();
        const lines = text.split('\n');
        let dataRows = csvHasHeaders ? lines.slice(1) : lines;
        dataRows = dataRows.filter((row) => row.trim() !== '');

        const firstRow = dataRows[0].split(',');
        const sampleData = csvHasHeaders
          ? Object.fromEntries(lines[0].split(',').map((col, i) => [col, firstRow[i]]))
          : Object.fromEntries(columnNames.map((col, i) => [col, firstRow[i]]));

        const detectedTypes = detectColumnTypes([sampleData]);

        const columns = csvHasHeaders
          ? lines[0].split(',').map((name, i) => ({
              name: name.trim(),
              type: detectedTypes[i] || 'string',
              originalType: typeof sampleData[name.trim()],
            }))
          : columnNames.map((name, i) => ({
              name: name.trim(),
              type: detectedTypes[i] || 'string',
              originalType: typeof sampleData[name.trim()],
            }));

        setTables([{ name: 'csv_data', columns }]);
      } else if (dataSourceType === 'json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const isArray = Array.isArray(jsonData);

        if (isArray && jsonData.length > 0) {
          const detectedTypes = detectColumnTypes(jsonData);
          const columns = Object.keys(jsonData[0]).map((key, i) => ({
            name: key,
            type: detectedTypes[i] || 'string',
            originalType: typeof jsonData[0][key],
          }));
          setTables([{ name: 'json_data', columns }]);
        } else if (!isArray) {
          const tables = Object.keys(jsonData).map((tableName) => {
            const tableData = jsonData[tableName];
            if (Array.isArray(tableData) && tableData.length > 0) {
              const detectedTypes = detectColumnTypes(tableData);
              const columns = Object.keys(tableData[0]).map((key, i) => ({
                name: key,
                type: detectedTypes[i] || 'string',
                originalType: typeof tableData[0][key],
              }));
              return { name: tableName, columns };
            }
            return { name: tableName, columns: [] };
          });
          setTables(tables);
        }
      } else if (dataSourceType === 'sqlite') {
        setActiveStep(Steps.Review);
      }
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [file, dataSourceType, csvHasHeaders, columnNames, detectColumnTypes]);

  useEffect(() => {
    if (activeStep === Steps.Configure && file) {
      processFile();
    }
  }, [activeStep, file, processFile]);

  const handleColumnTypeChange = (tableIndex: number, columnIndex: number, newType: DataType) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].columns[columnIndex].type = newType;
    setTables(updatedTables);
  };

  const handleColumnNameChange = (tableIndex: number, columnIndex: number, newName: string) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].columns[columnIndex].name = newName;
    setTables(updatedTables);
  };

  const convertColumnDefinitions = useCallback(
    (tableIndex: number): ApiColumnDefinition[] => {
      return tables[tableIndex].columns.map((col) => ({
        name: col.name,
        type: mapDataTypeToSqliteType(col.type),
        primaryKey: col.name.toLowerCase() === 'id',
      }));
    },
    [tables],
  );

  const handleSubmit = async () => {
    if (!file) {
      setError('Missing file');
      return;
    } else if (!isAuthenticated) {
      setError('Not authenticated');
    }

    setIsLoading(true);
    setActiveStep(Steps.Processing);
    setError(null);
    const renamedFile = renameFile(file, dataName);

    try {
      let result;

      if (dataSourceType === 'json') {
        const options: IJsonToSqliteOptions = {
          inferTypes: false,
          tables: tables.map((table) => ({
            name: table.name,
            columns: table.columns.map((col) => ({
              name: col.name,
              type: mapDataTypeToSqliteType(col.type),
              primaryKey: col.name.toLowerCase() === 'id',
            })),
          })),
        };

        result = await jsonToSqlite(renamedFile, options, dataName);
      } else if (dataSourceType === 'csv') {
        const options: ICsvToSqliteOptions = {
          tableName: tables[0].name,
          columns: convertColumnDefinitions(0),
        };

        result = await csvToSqlite(renamedFile, options, dataName);
      } else if (dataSourceType === 'sqlite') {
        result = await uploadSqlite(renamedFile, dataName);
      } else {
        throw new Error('Unsupported file type');
      }

      if (result.error) {
        setError(result.error);
      } else {
        toast.success('Data successfully uploaded');

        try {
          await clearTempFiles();
        } catch (clearError) {
          console.error('Error clearing temporary files:', clearError);
        }

        setTimeout(() => {
          setDataName('');
          setActiveStep(Steps.Name);
          setColumnNames([]);
          setFile(null);
          setTables([]);
          setCsvHasHeaders(false);
          setDataSourceType('');
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Data</DialogTitle>
          <DialogDescription>
            Import your data file in CSV, JSON, or SQLite format
          </DialogDescription>
        </DialogHeader>

        <Stepper
          steps={steps}
          currentStep={activeStep}
          setCurrentStep={setActiveStep}
          className="mb-4 mt-4"
          activeStepClassName="ring-2 ring-primary ring-offset-2"
          completedStepClassName="ring-2 ring-primary ring-offset-2"
        />

        <div className="space-y-4">
          {activeStep === Steps.Name && (
            <div className="space-y-2">
              <Label>Data Name</Label>
              <Input value={dataName} onChange={(e) => setDataName(e.target.value)} />
            </div>
          )}
          {activeStep === Steps.Type && (
            <div className="space-y-2">
              <Label>Data Source Type</Label>
              <Select
                value={dataSourceType}
                onValueChange={(value) => setDataSourceType(value as DataSourceType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON File</SelectItem>
                  <SelectItem value="sqlite">SQLite Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {activeStep === Steps.Upload && (
            <div className="space-y-4">
              <Label>Upload {dataSourceType.toUpperCase()} File</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept={`.${dataSourceType},${dataSourceType === 'sqlite' ? '.db,.sqlite' : ''}`}
              />

              {dataSourceType === 'csv' && (
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="csvHasHeaders"
                    checked={csvHasHeaders}
                    onCheckedChange={(checked) => setCsvHasHeaders(!!checked)}
                  />
                  <Label htmlFor="csvHasHeaders">First row contains column names</Label>
                </div>
              )}

              {!csvHasHeaders && file && dataSourceType == 'csv' ? (
                <div className="mt-4 space-y-2">
                  <Label>Enter Column Names (comma separated)</Label>
                  <Input
                    placeholder="column1, column2, column3"
                    onChange={(e) => setColumnNames(e.target.value.split(',').map((s) => s.trim()))}
                  />
                </div>
              ) : null}
            </div>
          )}

          {activeStep === Steps.Configure && (
            <div className="space-y-4">
              <Label>Configure Data Structure</Label>

              {isLoading ? (
                <div className="text-center py-8">
                  <p>Analyzing data structure...</p>
                </div>
              ) : (
                <Tabs defaultValue={tables?.[0]?.name}>
                  <TabsList className="flex w-full flex-wrap h-auto">
                    {tables.map((table) => (
                      <TabsTrigger key={table?.name} value={table?.name}>
                        {table?.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {tables.map((table, tableIndex) => (
                    <TabsContent key={table?.name} value={table?.name}>
                      <Card key={tableIndex} className="mb-6 max-h-56 overflow-auto sm:max-h-10/12">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between gap-1">
                            {table.name}
                            <Toggle
                              variant="outline"
                              pressed={isEditing}
                              onClick={() => setIsEditing((flag) => !flag)}>
                              <PencilLine />
                            </Toggle>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <TableView
                            isEditing={isEditing}
                            columnTypeChange={(...args) =>
                              handleColumnTypeChange(tableIndex, ...args)
                            }
                            columnNameChange={(...args) =>
                              handleColumnNameChange(tableIndex, ...args)
                            }
                            table={table}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          )}

          {activeStep === Steps.Processing && (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <LoadingSpinner />
                  <p className="text-center">Processing your data</p>
                </div>
              ) : null}
            </>
          )}

          {activeStep === Steps.Review && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>File Information</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="text-sm">{dataSourceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File Name</p>
                    <p className="text-sm">{file?.name}</p>
                  </div>
                  {dataSourceType === 'csv' && (
                    <div>
                      <p className="text-sm text-muted-foreground">Headers</p>
                      <p>{csvHasHeaders ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </div>
              </div>
              {dataSourceType === 'sqlite' ? null : (
                <>
                  <Label className="mb-2">Data Structure</Label>
                  <div className="space-y-2 max-h-56 overflow-auto">
                    {tables.map((table, index) => (
                      <Card key={index} className="p-4 gap-2">
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {table.columns.map((col, colIndex) => (
                            <Badge key={colIndex} variant="secondary">
                              {col.name} ({col.type})
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 rounded">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {activeStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep < Steps.Review ? (
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Next'}
            </Button>
          ) : activeStep === Steps.Review ? (
            <Button onClick={handleSubmit} disabled={isLoading}>
              Import Data
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)} disabled={isLoading}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
