import { useEffect } from 'react';
import useGeneralInfoStore from '../../store/GeneralInfoStore';

const Footer = () => {
  const { GeneralInfoList, GeneralInfoListRequest, GeneralInfoListLoading } =
    useGeneralInfoStore();

  useEffect(() => {
    const fetchData = async () => {
      await GeneralInfoListRequest(); // Fetch data from Zustand store
    };
    fetchData();
  }, [GeneralInfoListRequest]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="shadow rounded-lg p-3">
      <div className="flex justify-between items-center">
        <div>
          {currentYear} ©{' '}
          {GeneralInfoListLoading || !GeneralInfoList
            ? 'Loading...'
            : GeneralInfoList?.CompanyName}
        </div>
        <div>
          <p>
            Design and Developed by{' '}
            <a
              href="https://www.digiwebdigital.com/"
              className={'text-red-500 hover:underline'}
            >
              DigiWeb
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
