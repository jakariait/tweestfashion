import React, { useEffect } from 'react';
import DeliveryCharge from '../component/componentAdmin/DeliveryCharge.jsx';
import CreateShipping from '../component/componentAdmin/CreateShipping.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const DeliveryChargePage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('DELIVERY CHARGE', 'View All Deivery Charges');
  }, []);

  return (
    <RequirePermission permission="delivery_charges">
      <div className="flex flex-col gap-16">
        <CreateShipping />
        <DeliveryCharge />
      </div>
    </RequirePermission>
  );
};

export default DeliveryChargePage;
