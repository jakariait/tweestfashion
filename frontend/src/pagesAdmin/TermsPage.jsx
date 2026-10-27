import React, { useEffect } from 'react';
import PageEditor from '../component/componentAdmin/PageEditor.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const AddNewCategoryPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('TERM OF SERIVICES', 'Update Terms of Services');
  }, []);

  return (
    <RequirePermission permission="about_terms-policies">
      <PageEditor title="Terms of Services" endpoint="terms" />
      <Separator />
      <PageEditor title="Privacy Policy" endpoint="privacy" />
      <Separator />
      <PageEditor title="Refund Policy" endpoint="refund" />
      <Separator />
      <PageEditor title="Shipping Policy" endpoint="shipping" />
    </RequirePermission>
  );
};

export default AddNewCategoryPage;
