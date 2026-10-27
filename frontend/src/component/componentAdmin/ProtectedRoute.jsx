import { Navigate, Outlet } from 'react-router-dom';
import useAuthAdminStore from '../../store/AuthAdminStore.js';

const ProtectedRoute = () => {
  const { token } = useAuthAdminStore();

  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
