import React from 'react';

import PublicContentViewer from '../component/componentGeneral/PublicContentViewer.jsx';

const HomePage = () => {
  return (
    <>
      <PublicContentViewer title="About Us" endpoint="about" />
    </>
  );
};

export default HomePage;
