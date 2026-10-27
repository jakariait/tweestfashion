import React, { useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import EditBlog from '../component/componentAdmin/EditBlog.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const EditBlogPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('BLOGS', 'Edit Blog');
  }, []);

  return (
    <div>
      <RequirePermission permission="blogs">
        <EditBlog />
      </RequirePermission>
    </div>
  );
};

export default EditBlogPage;
