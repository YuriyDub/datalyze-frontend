import api from '../index';
import { mainApi } from '../index';
import { AxiosError } from 'axios';
import {
  IChat,
  IChatMessage,
  IChatResponse,
  ICreateChatRequest,
  IQueryResult,
  IExecuteQueryRequest,
  VisualizationType,
} from './types';

interface ApiErrorResponse {
  error: string;
}

export type {
  IChat,
  IChatMessage,
  IChatResponse,
  ICreateChatRequest,
  IQueryResult,
  IExecuteQueryRequest,
  VisualizationType,
};

export const chatApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<IChat[], void>({
      query: () => ({
        url: '/chats',
        method: 'GET',
      }),
    }),
    getChat: builder.query<{ chat: IChat; messages: IChatMessage[] }, string>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: 'GET',
      }),
    }),
    createChat: builder.mutation<IChat, ICreateChatRequest>({
      query: (data) => ({
        url: '/chats',
        method: 'POST',
        data,
      }),
    }),
    sendMessage: builder.mutation<IChatResponse, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/chats/${id}/messages`,
        method: 'POST',
        data: { message },
      }),
    }),
    executeQuery: builder.mutation<IQueryResult, IExecuteQueryRequest>({
      query: (data) => ({
        url: '/chats/execute-query',
        method: 'POST',
        data,
      }),
    }),
    updateChatTitle: builder.mutation<IChat, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/chats/${id}/title`,
        method: 'PUT',
        data: { title },
      }),
    }),
    deleteChat: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useExecuteQueryMutation,
  useUpdateChatTitleMutation,
  useDeleteChatMutation,
} = chatApi;

// Non-RTK Query functions for more direct usage
export const getChats = async (): Promise<IChat[]> => {
  try {
    const response = await api.get('/chats');
    return response.data.chats;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Failed to get chats:', axiosError);
    return [];
  }
};

export const getChat = async (id: string): Promise<{ chat: IChat; messages: IChatMessage[] }> => {
  try {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Failed to get chat ${id}:`, axiosError);
    throw new Error(`Failed to get chat: ${axiosError.message || 'Unknown error'}`);
  }
};

export const createChat = async (data: ICreateChatRequest): Promise<IChat> => {
  try {
    const response = await api.post('/chats', data);
    return response.data.chat;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorMessage = axiosError.response?.data?.error || 'Failed to create chat';
    throw new Error(errorMessage);
  }
};

export const sendMessage = async (
  id: string,
  message: string
): Promise<IChatResponse> => {
  try {
    const response = await api.post(`/chats/${id}/messages`, { message });
    return response.data.response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return {
      content: axiosError.response?.data?.error || 'Failed to send message',
      error: axiosError.response?.data?.error || 'Failed to send message',
    };
  }
};

export const executeQuery = async (
  datasetId: string,
  sqlQuery: string
): Promise<IQueryResult> => {
  try {
    const response = await api.post('/chats/execute-query', { datasetId, sqlQuery });
    return response.data.result;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(axiosError.response?.data?.error || 'Failed to execute query');
  }
};

export const updateChatTitle = async (id: string, title: string): Promise<IChat> => {
  try {
    const response = await api.put(`/chats/${id}/title`, { title });
    return response.data.chat;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(axiosError.response?.data?.error || 'Failed to update chat title');
  }
};

export const deleteChat = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/chats/${id}`);
    return {
      success: true,
      message: response.data.message || 'Chat deleted successfully',
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return {
      success: false,
      message: axiosError.response?.data?.error || 'Failed to delete chat',
    };
  }
};
