const metaCatalogService = require('../services/metaCatalogService');

/**
 * Meta Commerce Catalog Feed
 *
 * GET /api/catalog
 *
 * This endpoint is called by Meta Commerce Manager to fetch
 * the product catalog. It must be publicly accessible without
 * CORS restrictions because Meta's servers initiate the request.
 */
const getMetaCatalog = async (req, res) => {
  try {
    /**
     * CORS headers for Meta access.
     *
     * Meta's servers fetch this feed directly, so we must allow
     * all origins for this specific endpoint.
     */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    /**
     * Tell Meta/browser that this is a CSV feed.
     */
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    res.setHeader('Content-Disposition', 'inline; filename="meta-product-catalog.csv"');

    /**
     * Prevent caching of the feed.
     */
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    /**
     * Handle preflight OPTIONS request.
     */
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    await metaCatalogService.streamCatalogCSV(res);
  } catch (error) {
    console.error('Meta catalog controller error:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate Meta catalog',
        error: error.message,
      });
    }

    res.end();
  }
};

module.exports = {
  getMetaCatalog,
};
