import React from 'react';
import UserStats from '../component/componentGeneral/UserStats.jsx';
import RecentOrders from '../component/componentGeneral/RecentOrders.jsx';

const UserHomePage = () => {
  return (
    <>
      <UserStats />
      <RecentOrders />
    </>
  );
};

export default UserHomePage;
