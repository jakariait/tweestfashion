import React, { useEffect } from 'react';
import AddBlog from '../component/componentAdmin/AddBlog.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const CreateBlogPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('BLOGS', 'Create a Blog');
  }, []);

  return (
    <div>
      <RequirePermission permission="blogs">
        <AddBlog />
      </RequirePermission>
    </div>
  );
};

export default CreateBlogPage;
