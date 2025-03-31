import { createApi } from '@reduxjs/toolkit/query/react';
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = Cookies.get('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401) {
      await api.post('/auth/refresh');
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);

export const mainApi = createApi({
  reducerPath: 'mainApi',
  tagTypes: ['Profile'],
  baseQuery: async ({ url, method, params, headers, data }) => {
    const response = await api({ url, method, params, headers, data });
    return response;
  },
  endpoints: () => ({}),
});

export default api;
