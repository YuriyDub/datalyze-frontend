import api from '../index';
import { mainApi } from '../index';
import { AxiosError } from 'axios';
import {
  IColumnDefinition,
  ITableDefinition,
  IJsonToSqliteOptions,
  ICsvToSqliteOptions,
  IUploadResponse,
} from './types';

interface ApiErrorResponse {
  error: string;
}

export type {
  IColumnDefinition,
  ITableDefinition,
  IJsonToSqliteOptions,
  ICsvToSqliteOptions,
  IUploadResponse,
};

export const dataApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadDataset: builder.mutation<IUploadResponse, FormData>({
      query: (data) => ({
        url: '/files/dataset',
        method: 'POST',
        data,
      }),
    }),
    jsonToSqlite: builder.mutation<IUploadResponse, FormData>({
      query: (data) => ({
        url: '/files/json-to-sqlite',
        method: 'POST',
        data,
      }),
    }),
    csvToSqlite: builder.mutation<IUploadResponse, FormData>({
      query: (data) => ({
        url: '/files/csv-to-sqlite',
        method: 'POST',
        data,
      }),
    }),
    uploadSqlite: builder.mutation<IUploadResponse, FormData>({
      query: (data) => ({
        url: '/files/upload-sqlite',
        method: 'POST',
        data,
      }),
    }),
    getPrivateUrl: builder.query<{ url: string }, string>({
      query: (fileKey) => ({
        url: '/files/private-url',
        method: 'GET',
        params: { fileKey },
      }),
    }),
  }),
});

export const {
  useUploadDatasetMutation,
  useJsonToSqliteMutation,
  useCsvToSqliteMutation,
  useUploadSqliteMutation,
  useGetPrivateUrlQuery,
} = dataApi;

export const clearTempFiles = async (): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> => {
  try {
    const response = await api.post('/files/clear-temp');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Failed to clear temporary files:', axiosError);
    return {
      success: false,
      message: `Failed to clear temporary files: ${axiosError.message || 'Unknown error'}`,
    };
  }
};

export const uploadDataset = async (formData: FormData): Promise<IUploadResponse> => {
  try {
    const response = await api.post('/files/dataset', formData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.error) {
      return { error: axiosError.response.data.error };
    }
    return { error: 'Failed to upload dataset' };
  }
};

export const jsonToSqlite = async (
  file: File,
  options?: IJsonToSqliteOptions,
): Promise<IUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    const response = await api.post('/files/json-to-sqlite', formData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.error) {
      return { error: axiosError.response.data.error };
    }
    return { error: 'Failed to convert JSON to SQLite' };
  }
};

export const csvToSqlite = async (
  file: File,
  options: ICsvToSqliteOptions,
): Promise<IUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    const response = await api.post('/files/csv-to-sqlite', formData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.error) {
      return { error: axiosError.response.data.error };
    }
    return { error: 'Failed to convert CSV to SQLite' };
  }
};

export const uploadSqlite = async (file: File): Promise<IUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload-sqlite', formData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.error) {
      return { error: axiosError.response.data.error };
    }
    return { error: 'Failed to upload SQLite file' };
  }
};

export const getPrivateUrl = async (fileKey: string): Promise<string> => {
  try {
    const response = await api.get('/files/private-url', {
      params: { fileKey },
    });
    return response.data.url;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(`Failed to get private URL: ${axiosError.message || 'Unknown error'}`);
  }
};
