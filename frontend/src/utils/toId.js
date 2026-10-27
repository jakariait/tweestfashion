/**
 * Normalize any value that may be a populated mongoose document, a raw
 * ObjectId/ObjectId string, or null into a plain string id ('' when absent).
 */
const toId = (value) => {
  if (value == null) return '';
  if (value?._id != null) return String(value._id);
  if (typeof value === 'object') return '';
  return String(value);
};

export default toId;
export { toId };
