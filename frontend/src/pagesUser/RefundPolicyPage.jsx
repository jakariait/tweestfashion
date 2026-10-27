import React from 'react';

import PublicContentViewer from '../component/componentGeneral/PublicContentViewer.jsx';

const HomePage = () => {
  return (
    <>
      <PublicContentViewer title="Refund Policy" endpoint="refund" />
    </>
  );
};

export default HomePage;
