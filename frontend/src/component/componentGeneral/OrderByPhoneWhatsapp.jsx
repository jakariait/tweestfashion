import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { getWhatsAppLink } from '@/utils/brand';
import useGeneralInfoStore from '@/store/GeneralInfoStore';

const getVariantDisplayName = (variant) => {
  if (!variant) return 'N/A';
  if (variant.attributes && Array.isArray(variant.attributes)) {
    const attributeValues = variant.attributes
      .map((attr) => attr.value)
      .filter((val) => val);
    if (attributeValues.length > 0) {
      return attributeValues.join(' / ');
    }
  }
  return 'N/A';
};

const OrderByPhoneWhatsapp = ({
  product,
  quantity = 1,
  price = 0,
  selectedVariant,
}) => {
  const { GeneralInfoList } = useGeneralInfoStore();

  const whatsappNumber = GeneralInfoList?.WhatsAppNumber?.trim();

  if (!product || !whatsappNumber) return null;

  const formatPrice = (value) =>
    isNaN(Number(value)) ? value : Number(value).toLocaleString();

  const hasVariants = product.variants?.length > 0;
  const variantLine = selectedVariant
    ? `Variant: ${getVariantDisplayName(selectedVariant)}`
    : null;

  const whatsappMessage = [
    'Hello, I want to place an order (Cash on Delivery):',
    `Product: ${product.name}`,
    variantLine,
    `Quantity: ${quantity}`,
    `Price: Tk. ${formatPrice(price)}`,
    'Payment: Cash on Delivery',
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappLink = `${getWhatsAppLink()}?text=${encodeURIComponent(whatsappMessage)}`;
  const telLink = `tel:${whatsappNumber.replace(/\D/g, '')}`;

  const variantRequired = hasVariants && !selectedVariant;

  return (
    <div className="mt-5 grid grid-cols-1 gap-2 md:gap-3">
      {variantRequired && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-orange-800 text-sm text-center">
          Please select a variant before placing an order.
        </div>
      )}

      {!variantRequired && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-[#28D366] hover:opacity-90 text-white font-semibold text-sm md:text-base rounded-lg px-3 py-2.5 md:py-3 transition"
        >
          <FaWhatsapp className="text-lg md:text-xl shrink-0" />
          Order on WhatsApp
        </a>
      )}

      <a
        href={telLink}
        className="flex items-center justify-center gap-2 primaryBgColor accentTextColor hover:opacity-90 font-semibold text-sm md:text-base rounded-lg px-3 py-2.5 md:py-3 transition"
      >
        <FaPhoneAlt className="text-lg md:text-xl shrink-0" />
        <span className="flex flex-col leading-tight text-center">
          <span>Call to Order</span>
          <span className="text-[11px] md:text-xs font-normal opacity-90">
            {whatsappNumber}
          </span>
        </span>
      </a>
    </div>
  );
};

export default OrderByPhoneWhatsapp;
