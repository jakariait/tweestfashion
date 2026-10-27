import { useEffect } from 'react';
import AdminCreate from '../component/componentAdmin/AdminCreate.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const CreateAdminPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('SYSTEM USERS', 'Create System User');
  }, []);

  return (
    <RequirePermission permission="admin-users">
      <AdminCreate />
    </RequirePermission>
  );
};

export default CreateAdminPage;
