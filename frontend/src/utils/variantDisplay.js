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

  if (variant.size?.name) {
    return variant.size.name;
  }

  return 'N/A';
};

export { getVariantDisplayName };
