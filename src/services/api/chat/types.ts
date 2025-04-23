export interface IChat {
  id: string;
  userId: string;
  datasetId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  datasetName?: string;
}

export interface IChatMessage {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant';
  title?: string;
  createdAt: string;
  sqlQuery?: string;
  visualizationType?: VisualizationType;
}

export interface IChatResponse {
  content: string;
  title?: string;
  sqlQuery?: string;
  visualizationType?: VisualizationType;
  error?: string;
}

export interface ICreateChatRequest {
  datasetId: string;
  title?: string;
}

export interface IQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface IExecuteQueryRequest {
  datasetId: string;
  sqlQuery: string;
}

export type VisualizationType = 'bar' | 'line' | 'pie' | 'scatter' | 'table' | 'stroke' | 'none';
