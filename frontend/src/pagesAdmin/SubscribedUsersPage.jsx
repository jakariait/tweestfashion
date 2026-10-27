import React, { useEffect } from 'react';
import SubscribersList from '../component/componentAdmin/SubscribersList.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const SubscribedUsersPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('USER SUBSCRIPTION', 'View All Subscribed Users');
  }, []);

  return (
    <div>
      {/* Form Section */}
      <RequirePermission permission="subscribed_users">
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <SubscribersList />
        </div>
      </RequirePermission>
    </div>
  );
};

export default SubscribedUsersPage;
