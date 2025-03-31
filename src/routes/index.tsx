import Login from '@/pages/Login/Login';
import Signup from '@/pages/Signup/Signup';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { useAuth } from '@/hooks/use-auth';
import { PublicRoute } from './PublicRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import DataPage from '@/pages/DataPage/DataPage';
import Home from '@/pages/Home/Home';

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null)
    return (
      <div className="flex justify-center items-center  h-lvh">
        <LoadingSpinner />
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Home />} />
          <Route path="/your-data" element={<DataPage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
