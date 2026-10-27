import React from 'react';
import ChangePassword from '../component/componentGeneral/ChangePassword.jsx';
import useAuthUserStore from '../store/AuthUserStore.js';

const ChangePasswordPage = () => {
  const { token } = useAuthUserStore(); // adjust based on your store logic

  if (!token) return <p>Please login first</p>;

  return <ChangePassword token={token} />;
};

export default ChangePasswordPage;
