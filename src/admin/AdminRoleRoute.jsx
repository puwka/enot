import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

const AdminRoleRoute = ({ permission, children }) => {
  const { hasPermission, authorize, loading, isAuthenticated } = useAdminAuth();
  const [serverState, setServerState] = useState('checking');

  useEffect(() => {
    let active = true;
    if (loading || !isAuthenticated) return undefined;

    if (!hasPermission(permission)) {
      setServerState('forbidden');
      return undefined;
    }

    authorize(permission)
      .then(() => {
        if (active) setServerState('ok');
      })
      .catch((error) => {
        if (!active) return;
        if (error?.status === 401) setServerState('unauthorized');
        else setServerState('forbidden');
      });

    return () => {
      active = false;
    };
  }, [permission, authorize, hasPermission, loading, isAuthenticated]);

  if (loading || serverState === 'checking') {
    return (
      <div className="admin-loading">
        <div className="admin-loading__card">Проверяем доступ…</div>
      </div>
    );
  }

  if (serverState === 'unauthorized') {
    return <Navigate to="/admin/login" replace />;
  }

  if (serverState === 'forbidden' || !hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminRoleRoute;
