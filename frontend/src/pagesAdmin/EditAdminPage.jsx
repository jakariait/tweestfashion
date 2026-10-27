import React, { useEffect } from 'react';
import EditAdmin from '../component/componentAdmin/EditAdmin.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const EditAdminPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('SYSTEM USERS', 'Update System User');
  }, []);

  return (
    <RequirePermission permission="admin-users">
      <EditAdmin />
    </RequirePermission>
  );
};

export default EditAdminPage;
