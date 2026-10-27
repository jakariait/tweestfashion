import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_URL = process.env.VITE_API_URL;
const FRONTEND_URL = 'https://ecommerce.digiwebdigital.com';

const generateRobotsTxt = () => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Sitemap: ${FRONTEND_URL}/sitemap.xml
`;
  const publicDir = path.join(__dirname, '..', 'public');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  console.log('✅ robots.txt generated');
};

const generateSitemap = async () => {
  let products = [];
  let categories = [];
  let blogs = [];

  try {
    console.log('Fetching data from API...');

    const [productsRes, categoriesRes, blogsRes] = await Promise.all([
      axios.get(`${API_URL}/getAllProducts`),
      axios.get(`${API_URL}/category`),
      axios.get(`${API_URL}/activeblog`),
    ]);

    products =
      productsRes.data?.products ||
      productsRes.data?.data ||
      productsRes.data ||
      [];
    categories =
      categoriesRes.data?.categories ||
      categoriesRes.data?.data ||
      categoriesRes.data ||
      [];
    blogs = blogsRes.data?.data || blogsRes.data || [];
  } catch (error) {
    console.warn(
      `Warning: Could not fetch from API (${error.message}). Generating sitemap with static pages only.`,
    );
  }

  console.log(
    `Found ${products.length} products, ${categories.length} categories, ${blogs.length} blogs`,
  );

  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/shop', changefreq: 'daily', priority: 0.9 },
    { loc: '/contact-us', changefreq: 'monthly', priority: 0.7 },
    { loc: '/about', changefreq: 'monthly', priority: 0.7 },
    { loc: '/faqs', changefreq: 'monthly', priority: 0.6 },
    { loc: '/track-order', changefreq: 'monthly', priority: 0.5 },
    { loc: '/login', changefreq: 'monthly', priority: 0.5 },
    { loc: '/register', changefreq: 'monthly', priority: 0.5 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
    { loc: '/termofservice', changefreq: 'monthly', priority: 0.5 },
    { loc: '/privacypolicy', changefreq: 'monthly', priority: 0.5 },
    { loc: '/refundpolicy', changefreq: 'monthly', priority: 0.5 },
    { loc: '/shippinpolicy', changefreq: 'monthly', priority: 0.5 },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  staticPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${FRONTEND_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  categories.forEach((cat) => {
    if (cat.isActive !== false) {
      sitemap += `  <url>
    <loc>${FRONTEND_URL}/shop?category=${encodeURIComponent(cat.name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  });

  products.forEach((product) => {
    if (product.isActive !== false) {
      const updatedAt = product.updatedAt
        ? new Date(product.updatedAt).toISOString().split('T')[0]
        : today;
      sitemap += `  <url>
    <loc>${FRONTEND_URL}/product/${product.slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  });

  blogs.forEach((blog) => {
    if (blog.isActive !== false) {
      const updatedAt = blog.updatedAt
        ? new Date(blog.updatedAt).toISOString().split('T')[0]
        : today;
      sitemap += `  <url>
    <loc>${FRONTEND_URL}/blogs/${blog.slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
  });

  sitemap += `</urlset>`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`✅ Sitemap generated at public/sitemap.xml`);
  console.log(
    `   Total URLs: ${staticPages.length + categories.length + products.length + blogs.length}`,
  );
};

generateRobotsTxt();
generateSitemap();
