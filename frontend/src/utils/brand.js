import useGeneralInfoStore from '@/store/GeneralInfoStore';

export const getWhatsAppLink = () => {
  const { GeneralInfoList } = useGeneralInfoStore.getState();
  const raw = GeneralInfoList?.WhatsAppNumber || '';
  const digits = raw.replace(/\D/g, '');
  const phone = digits.startsWith('880') ? digits : `880${digits}`;
  return `https://wa.me/${phone}`;
};
