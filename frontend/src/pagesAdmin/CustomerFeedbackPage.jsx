import { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import CustomerFeedbackAllinone from '../component/componentAdmin/CustomerFeedbackAllinone.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const CustomerFeedbackPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('CUSTOMER FEEDBACK', 'View And Edit All Customer Feedback');
  }, []);

  return (
    <RequirePermission permission="customer_feedback">
      <CustomerFeedbackAllinone />
    </RequirePermission>
  );
};

export default CustomerFeedbackPage;
