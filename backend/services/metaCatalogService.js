const ProductModel = require('../models/ProductModel');
const { stringify } = require('csv-stringify');

const STORE_URL = (process.env.STORE_URL || 'https://mmcomputerbd.com').replace(/\/$/, '');
const UPLOADS_URL = (process.env.UPLOADS_URL || `https://server.mmcomputerbd.com/uploads`).replace(
  /\/$/,
  ''
);

/**
 * Convert a value to a clean string
 */
const cleanText = (value) => {
  if (value === undefined || value === null) return '';

  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Escape HTML-ish / unnecessary content from descriptions
 */
const cleanDescription = (value) => {
  return cleanText(value).replace(/[\r\n]+/g, ' ');
};

/**
 * Build absolute image URL
 */
const getImageUrl = (filename) => {
  if (!filename) return '';

  // Already absolute URL
  if (/^https?:\/\//i.test(filename)) {
    return filename;
  }

  return `${UPLOADS_URL}/${encodeURIComponent(filename)}`;
};

/**
 * Build product URL
 */
const getProductUrl = (slug) => {
  if (!slug) return '';

  return `${STORE_URL}/product/${encodeURIComponent(slug)}`;
};

/**
 * Get effective price for a variant
 *
 * Your schema uses:
 * price = regular price
 * discount = discounted/selling price
 *
 * Example:
 * price: 1500
 * discount: 1290
 */
const getPricing = (price, discount) => {
  const regularPrice = Number(price || 0);
  const discountPrice = Number(discount || 0);

  if (discountPrice > 0 && discountPrice < regularPrice) {
    return {
      price: regularPrice,
      salePrice: discountPrice,
    };
  }

  return {
    price: regularPrice,
    salePrice: null,
  };
};

/**
 * Build readable variant title
 *
 * Example:
 * T-Shirt - Red / XL
 */
const buildVariantTitle = (productName, variant) => {
  if (!variant?.attributes?.length) {
    return cleanText(productName);
  }

  const attributes = variant.attributes
    .map((attribute) => cleanText(attribute.value))
    .filter(Boolean);

  if (!attributes.length) {
    return cleanText(productName);
  }

  return `${cleanText(productName)} - ${attributes.join(' / ')}`;
};

/**
 * Get additional images
 *
 * Meta allows additional images besides the main image.
 */
const getAdditionalImages = (product) => {
  if (!Array.isArray(product.images)) return [];

  return product.images
    .filter(Boolean)
    .map(getImageUrl)
    .filter(Boolean)
    .filter((url) => url !== getImageUrl(product.thumbnailImage));
};

/**
 * Get brand name.
 *
 * We populate brand only, because the feed doesn't need
 * category/flags/subcategory documents.
 */
const getBrandName = (product) => {
  if (!product.brand) return '';

  if (typeof product.brand === 'object') {
    return cleanText(product.brand.name);
  }

  return '';
};

/**
 * Build one Meta catalog item
 */
const buildCatalogItem = (product, variant = null) => {
  const hasVariant = Boolean(variant);

  const pricing = hasVariant
    ? getPricing(variant.price, variant.discount)
    : getPricing(product.finalPrice, product.finalDiscount);

  const stock = hasVariant ? Number(variant.stock || 0) : Number(product.finalStock || 0);

  /**
   * Product ID:
   *
   * Parent:
   * 123
   *
   * Variant:
   * 123-V-variantMongoId
   */
  const itemId = hasVariant ? `${product.productId}-V-${variant._id}` : String(product.productId);

  const title = hasVariant ? buildVariantTitle(product.name, variant) : cleanText(product.name);

  const description =
    cleanDescription(product.metaDescription) ||
    cleanDescription(product.longDesc) ||
    cleanDescription(product.name);

  const additionalImages = getAdditionalImages(product);

  const item = {
    id: itemId,

    title,

    description,

    availability: stock > 0 ? 'in stock' : 'out of stock',

    condition: 'new',

    price: `${pricing.price.toFixed(2)} BDT`,

    link: getProductUrl(product.slug),

    image_link: getImageUrl(product.thumbnailImage),

    brand: getBrandName(product),

    item_group_id: String(product.productId),
  };

  /**
   * Only include sale_price when there is actually
   * a discounted price.
   */
  if (pricing.salePrice !== null) {
    item.sale_price = `${pricing.salePrice.toFixed(2)} BDT`;
  }

  /**
   * Product code as MPN
   */
  if (product.productCode) {
    item.mpn = cleanText(product.productCode);
  }

  /**
   * Additional images
   */
  if (additionalImages.length) {
    item.additional_image_link = additionalImages.join(',');
  }

  /**
   * Free shipping
   *
   * Meta's feed shipping field is more complicated because
   * shipping rules depend on your actual delivery policy.
   *
   * We intentionally don't send shipping information here.
   */

  return item;
};

/**
 * Stream Meta catalog CSV
 *
 * This is intentionally implemented with a MongoDB cursor.
 *
 * It means 4,000+ products don't need to be loaded into
 * memory simultaneously.
 */
const streamCatalogCSV = async (res) => {
  const columns = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'sale_price',
    'link',
    'image_link',
    'additional_image_link',
    'brand',
    'item_group_id',
    'mpn',
  ];

  const csvStringifier = stringify({
    header: true,
    columns,
  });

  /**
   * Pipe CSV directly to HTTP response
   */
  csvStringifier.pipe(res);

  /**
   * Only fetch the fields required by Meta.
   *
   * Using batch size of 500 to balance memory usage and
   * database round trips for 4000+ products.
   */
  const cursor = ProductModel.find({
    isActive: true,
  })
    .select(
      [
        'productId',
        'name',
        'slug',
        'metaDescription',
        'longDesc',
        'productCode',
        'thumbnailImage',
        'images',
        'variants',
        'finalPrice',
        'finalDiscount',
        'finalStock',
      ].join(' ')
    )
    .lean()
    .batchSize(500)
    .cursor();

  try {
    for await (const product of cursor) {
      /**
       * Products with variants
       */
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        for (const variant of product.variants) {
          csvStringifier.write(buildCatalogItem(product, variant));
        }
      }

      /**
       * Products without variants
       */
      else {
        csvStringifier.write(buildCatalogItem(product));
      }
    }

    csvStringifier.end();
  } catch (error) {
    console.error('Meta catalog generation error:', error);

    /**
     * If headers are already sent, destroy the stream.
     */
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate Meta catalog',
        error: error.message,
      });
    } else {
      csvStringifier.destroy(error);
    }
  }
};

module.exports = {
  streamCatalogCSV,
};
