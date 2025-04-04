export interface IColumnDefinition {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'NULL';
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: unknown;
}

export interface ITableDefinition {
  name: string;
  columns: IColumnDefinition[];
}

export interface IJsonToSqliteOptions {
  tables?: ITableDefinition[];
  inferTypes?: boolean;
}

export interface ICsvToSqliteOptions {
  tableName: string;
  columns: IColumnDefinition[];
}

export interface IUploadResponse {
  key?: string;
  url?: string;
  message?: string;
  error?: string;
  dataset?: IDataset;
}

export interface IDatasetInfo {
  id: string;
  name: string;
  fileKey: string;
  fileSize: number;
  createdAt: Date;
  fileType: string;
}

export interface IDataset {
  id: string;
  name: string;
  file_key: string;
  user_id: string;
  created_at: Date;
  file_type: string;
  file_size: number;
}
