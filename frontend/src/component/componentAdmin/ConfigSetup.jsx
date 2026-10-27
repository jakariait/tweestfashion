import UpdateFreeDeliveryAmount from './UpdateFreeDeliveryAmount.jsx';
import UpdateTaxPercentage from './UpdateTaxPercentage.jsx';
import UpdateGTM from './UpdateGTM.jsx';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const ConfigSetup = () => {
  return (
    <div className={'shadow rounded-lg p-4'}>
      <SectionHeader title={'Update Setup Config'} />
      <div className={'grid md:grid-cols-2 gap-6'}>
        <UpdateFreeDeliveryAmount />
        <UpdateTaxPercentage />
        <UpdateGTM />
      </div>
    </div>
  );
};

export default ConfigSetup;
