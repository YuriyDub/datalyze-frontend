import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  isAuthenticated: boolean | null;
}

export const PrivateRoute = ({ isAuthenticated }: PrivateRouteProps) => {
  const location = useLocation();
  const redirectRoute = location.pathname === '/signup' ? location.pathname : '/login';
  return isAuthenticated ? (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  ) : (
    <Navigate to={redirectRoute} />
  );
};
