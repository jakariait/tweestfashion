import React from 'react';

import PublicContentViewer from '../component/componentGeneral/PublicContentViewer.jsx';

const HomePage = () => {
  return (
    <>
      <PublicContentViewer title="Shipping Policy" endpoint="shipping" />
    </>
  );
};

export default HomePage;
