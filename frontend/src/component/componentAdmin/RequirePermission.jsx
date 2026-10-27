import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Skeleton } from '@/components/ui/skeleton';

const RequirePermission = ({
  permission,
  children,
  fallback,
  match = 'all',
}) => {
  const { admin, loading } = useAuthAdminStore();
  const userPermissions = admin?.permissions;

  const requiredPermissions = Array.isArray(permission)
    ? permission
    : [permission];

  const hasPermission =
    Array.isArray(userPermissions) &&
    (match === 'any'
      ? requiredPermissions.some((perm) => userPermissions.includes(perm))
      : requiredPermissions.every((perm) => userPermissions.includes(perm)));

  if (fallback === true) return <>{children}</>;

  if (!hasPermission && (loading || !Array.isArray(userPermissions))) {
    return (
      <div className="flex justify-center py-4">
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    );
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className="p-2 border border-dashed border-muted-foreground/30 rounded-md">
      <p className="text-destructive text-sm">
        You do not have permission to access this section.
      </p>
    </div>
  );
};

export default RequirePermission;
