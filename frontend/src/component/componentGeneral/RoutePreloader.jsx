import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadUserRoutes } from '../../utils/routePreloader';

let userPreloaded = false;

export const RoutePreloader = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (!userPreloaded && path.startsWith('/user') && path !== '/user/home') {
      userPreloaded = true;
      preloadUserRoutes();
    }
  }, [location]);

  return null;
};
