import React, { useEffect } from 'react';
import BlogList from '../component/componentAdmin/BlogList.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const BlogsListPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('BLOGS', 'Create a Blog');
  }, []);

  return (
    <div>
      <RequirePermission permission="blogs">
        <BlogList />
      </RequirePermission>
    </div>
  );
};

export default BlogsListPage;
