import React from 'react';
import UpdateUserForm from '../component/componentGeneral/UpdateUserForm.jsx';
import useAuthUserStore from '../store/AuthUserStore.js';

const UpdateUserPage = () => {
  const { token } = useAuthUserStore(); // adjust based on your store logic

  if (!token) return <p>Please login first</p>;

  return <UpdateUserForm token={token} />;
};

export default UpdateUserPage;
