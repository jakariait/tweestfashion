import React from 'react';

import PublicContentViewer from '../component/componentGeneral/PublicContentViewer.jsx';

const HomePage = () => {
  return (
    <>
      <PublicContentViewer title="Privacy Policy" endpoint="privacy" />
    </>
  );
};

export default HomePage;
