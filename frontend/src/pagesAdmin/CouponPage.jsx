import React, { useEffect } from 'react';
import CouponTable from '../component/componentAdmin/CouponTable.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AddNewCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('PROMO CODE', 'View and Create Promo Code');
  }, []);

  return (
    <RequirePermission permission="manage_coupons">
      <CouponTable />
    </RequirePermission>
  );
};

export default AddNewCategoryPage;
