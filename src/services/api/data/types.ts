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
}
