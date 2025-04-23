import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ILoginFormState, ISignupFormState } from '@/features/auth/types';
import { toast } from 'sonner';

interface IAuthContextType {
  isAuthenticated: boolean | null;
  signup: (data: ISignupFormState) => Promise<void>;
  login: (data: ILoginFormState) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextType | null>(null);

const authApi = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'http://ec2-51-20-122-41.eu-north-1.compute.amazonaws.com/api/auth'
      : 'http://localhost:3000/api/auth',
  withCredentials: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const signup = async (data: ISignupFormState) => {
    try {
      const response = await authApi.post('/signup', data);

      if (response.status === 201) {
        setIsAuthenticated(true);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        toast.warning(String(error.response.data.message));
      } else {
        toast.warning('An unexpected error occurred');
      }
    }
  };

  const login = async (data: ILoginFormState) => {
    try {
      const response = await authApi.post('/login', data);
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        toast.warning(String(error.response.data.message));
      } else {
        toast.warning('An unexpected error occurred');
      }
    }
  };

  const logout = async () => {
    try {
      const response = await authApi.post('/logout');
      if (response.status === 200) {
        setIsAuthenticated(false);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        toast.warning(String(error.response.data.message));
      } else {
        toast.warning('An unexpected error occurred');
      }
    }
  };

  const refresh = async () => {
    try {
      const response = await authApi.post('/refresh');
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error: unknown) {
      setIsAuthenticated(false);
      if (error instanceof AxiosError && error.response) {
        toast.warning(String(error.response.data.message));
      } else {
        toast.warning('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      await refresh();
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signup, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
