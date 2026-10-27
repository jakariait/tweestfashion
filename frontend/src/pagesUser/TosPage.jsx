import React from 'react';

import PublicContentViewer from '../component/componentGeneral/PublicContentViewer.jsx';

const HomePage = () => {
  return (
    <>
      <PublicContentViewer title="Terms of Services" endpoint="terms" />
    </>
  );
};

export default HomePage;
