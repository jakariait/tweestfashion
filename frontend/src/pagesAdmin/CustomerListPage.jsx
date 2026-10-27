import React, { useEffect } from 'react';
import CustomerList from '../component/componentAdmin/CustomerList.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import CustomerListFromOrder from '@/component/componentAdmin/CustomerListFromOrder.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const CustomerListPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CUSTOMERS', 'View All Customers');
  }, []);

  return (
    <RequirePermission permission="view_customers">
      <div className={'flex flex-col gap-10'}>
        <CustomerListFromOrder />
        <CustomerList />
      </div>
    </RequirePermission>
  );
};

export default CustomerListPage;
