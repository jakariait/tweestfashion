import { useMediaQuery } from 'react-responsive';

const useIsMobile = (maxWidth = 768) => {
  return useMediaQuery({ maxWidth });
};

export default useIsMobile;
