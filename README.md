# 🛒 MERN Stack eCommerce Web Application

A full-featured eCommerce platform built using the **MERN Stack** (MongoDB, Express, React, Node.js) with modern tools and best practices. This application provides extensive user and admin functionalities, including comprehensive product management, a robust shopping cart, streamlined checkout with promo codes, and secure payment integrations.

## 🚀 Features

### 👤 User Side
- **Secure Authentication:** Register/Login with JWT Authentication.
- **Product Catalog:** Extensive product listings with filtering, sorting, and variant (color, size) support.
- **Shopping Cart:** Add to cart functionality with quantity and variant tracking, abandoned cart recovery.
- **Dynamic Checkout:**
  - Flexible shipping options and address management.
  - Apply percentage/amount-based promo codes.
  - Multiple payment gateway integrations (e.g., bKash, potentially others like Stripe/PayPal).
- **Order Management:** View order history and status updates.
- **Content:** Blog, FAQ, contact forms, newsletters.
- **SEO & Analytics:** Integrated Google Tag Manager and meta-content management.

### 🔐 Admin Panel
- **Comprehensive Dashboard:** Overview with key metrics, charts, and summary cards (powered by Nivo charts).
- **Product Management:** Full CRUD operations for products, including variants (colors, sizes), images, categories, subcategories, and flags.
- **Order Management:** Track, update, and analyze orders with detailed analytics.
- **User Management:** Role-based access control and user administration.
- **Content Management:** Manage blogs, FAQs, page content, carousels, feature images, marquee messages, social media links, and general information.
- **Promotions & Discounts:** Create and manage promo codes and free delivery settings.
- **Shipping & Payments:** Configure shipping methods (e.g., Steadfast courier integration), VAT percentages, and payment gateways (e.g., bKash configuration).
- **SEO Tools:** Manage meta tags and Google Tag Manager settings.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (with Vite for fast development and bundling)
- **State Management:** Zustand
- **UI/Components:** Material-UI (MUI), PrimeReact
- **Styling:** Tailwind CSS, Emotion (for MUI customization)
- **Routing:** React Router DOM
- **API Client:** Axios, React Query (TanStack Query)
- **Animations:** Framer Motion
- **Forms:** React Hook Form
- **Data Display:** React Data Table Component
- **Charts:** Nivo
- **Utilities:** Day.js (date manipulation), Quill (rich text editor), React Slick (carousels), LightGallery (image viewer), Dnd Kit (drag and drop)
- **Analytics & SEO:** React GA4, React GTM Module, React Helmet

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing
- **Security:** Helmet, HPP, Express Rate Limit, Mongo Sanitize, Express XSS Sanitizer
- **File Uploads:** Multer
- **Email Services:** Nodemailer
- **Scheduled Tasks:** Node-cron
- **API Structure:** RESTful APIs following Controller-Service-Model pattern
- **Utilities:** Axios, Body-parser, Compression, Cookie-parser, CORS, Dotenv, Slugify

## 🌐 Deployment
- **Frontend:** Vercel
- **Backend:** Render
# tweestfashion
