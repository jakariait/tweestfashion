import React, { useEffect } from 'react';
import AdminList from '../component/componentAdmin/AdminList.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AdminListPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('SYSTEM USERS', 'View All System Users');
  }, []);

  return (
    <RequirePermission permission="admin-users">
      <AdminList />
    </RequirePermission>
  );
};

export default AdminListPage;
