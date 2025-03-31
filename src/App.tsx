import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/use-auth';
import { AppRoutes } from './routes';

export const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
};
