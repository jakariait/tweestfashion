import React, { useEffect } from 'react';
import ContactTable from '../component/componentAdmin/ContactTable.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const ContactRequestPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CONTACT REQUEST', 'View All Contact Request');
  }, []);

  return (
    <RequirePermission permission="contact_request">
      <ContactTable />
    </RequirePermission>
  );
};

export default ContactRequestPage;
