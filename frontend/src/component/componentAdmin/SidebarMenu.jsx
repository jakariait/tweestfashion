import {
  Boxes,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Info,
  LayoutGrid,
  List,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Tags,
  UserRound,
  MessageSquareQuote,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { useNavigate } from 'react-router-dom';
import useProductStore from '../../store/useProductStore.js';
import useOrderStore from '../../store/useOrderStore.js';
import React, { useEffect, useState, useCallback } from 'react';
import RequirePermission from './RequirePermission.jsx';
import { ChevronDown } from 'lucide-react';

// Single source of truth for the size of every menu icon
const ICON_CLASS = 'size-4';

const MENU_CONFIG = [
  {
    section: 'dashboard',
    items: [
      {
        type: 'link',
        label: 'Dashboard',
        icon: Home,
        path: '/admin/dashboard',
        permission: 'dashboard',
      },
    ],
  },
  {
    section: 'websiteConfig',
    label: 'Website Config',
    icon: LayoutGrid,
    permission: ['website_theme_color', 'general_info', 'home_page_seo'],
    match: 'any',
    items: [
      {
        type: 'link',
        label: 'General Info',
        path: '/admin/general-info',
        permission: 'general_info',
      },
      {
        type: 'link',
        label: 'Website Theme Color',
        path: '/admin/color-updater/',
        permission: 'website_theme_color',
      },
      {
        type: 'link',
        label: 'Social Media Links',
        path: '/admin/social-link-updater',
        permission: 'website_theme_color',
      },
      {
        type: 'link',
        label: 'Home Page SEO',
        path: '/admin/homepage-seo',
        permission: 'home_page_seo',
      },
    ],
  },
  {
    section: 'config',
    label: 'Config',
    icon: Settings,
    permission: [
      'setup_config',
      'product_size',
      'product_flag',
      'scroll_text',
      'delivery_charges',
      'manage_coupons',
    ],
    match: 'any',
    items: [
      {
        type: 'link',
        label: 'Setup Your Config',
        path: '/admin/configsetup',
        permission: 'setup_config',
      },
      {
        type: 'link',
        label: 'Product Options',
        path: '/admin/product-options',
        permission: 'product_size',
      },
      {
        type: 'link',
        label: 'Product Flags',
        path: '/admin/product-flags',
        permission: 'product_flag',
      },
      {
        type: 'link',
        label: 'Scroll Text',
        path: '/admin/scroll-text',
        permission: 'scroll_text',
      },
      {
        type: 'link',
        label: 'Delivery Charges',
        path: '/admin/deliverycharge',
        permission: 'delivery_charges',
      },
      {
        type: 'link',
        label: 'Coupon',
        path: '/admin/coupon',
        permission: 'manage_coupons',
      },
    ],
  },
  {
    section: 'category',
    items: [
      {
        type: 'link',
        label: 'Category',
        icon: LayoutGrid,
        path: '/admin/category',
        permission: 'category',
      },
    ],
  },
  {
    section: 'subcategory',
    items: [
      {
        type: 'link',
        label: 'Subcategory',
        icon: Boxes,
        path: '/admin/subcategory',
        permission: 'sub_category',
      },
    ],
  },
  {
    section: 'childcategory',
    items: [
      {
        type: 'link',
        label: 'Child Category',
        icon: List,
        path: '/admin/childcategory',
        permission: 'child_category',
      },
      {
        type: 'link',
        label: 'Brands',
        icon: Award,
        path: '/admin/brands',
        permission: 'brands',
      },
    ],
  },
  {
    section: 'products',
    items: [
      {
        type: 'link',
        label: 'Manage Products',
        icon: Tags,
        path: '/admin/manage-products',
        permission: 'view_products',
        showCount: 'allProductsCount',
      },
    ],
  },
  {
    section: 'orders',
    items: [
      {
        type: 'link',
        label: 'Manage Orders',
        icon: ShoppingBag,
        path: '/admin/manage-orders',
        permission: 'view_orders',
        showCount: 'totalOrders',
      },
    ],
  },
  {
    section: 'incompleteOrders',
    items: [
      {
        type: 'link',
        label: 'Incomplete Order',
        icon: ClipboardList,
        path: '/admin/incomplete-order',
        permission: 'incomplete_orders',
      },
    ],
  },
  {
    section: 'gateway',
    items: [
      {
        type: 'link',
        label: 'Gateway & API',
        icon: CreditCard,
        path: '/admin/gateway-api',
        permission: ['bkash_api', 'steadfast_api', 'pathao_api'],
      },
    ],
  },
  {
    section: 'customers',
    items: [
      {
        type: 'link',
        label: 'Customers',
        icon: UserRound,
        path: '/admin/customers',
        permission: 'view_customers',
      },
      {
        type: 'link',
        label: 'Customers Feedback',
        icon: MessageSquareQuote,
        path: '/admin/customer-feedback',
        permission: 'customer_feedback',
      },
    ],
  },
  {
    section: 'other',
    items: [
      {
        type: 'link',
        label: 'Contact Request',
        icon: Mail,
        path: '/admin/contact-request',
        permission: 'contact_request',
      },
      {
        type: 'link',
        label: 'Subscribed Users',
        icon: UserRound,
        path: '/admin/subscribed-users',
        permission: 'subscribed_users',
      },
      {
        type: 'link',
        label: 'Blogs',
        icon: Newspaper,
        path: '/admin/blogs',
        permission: 'blogs',
      },
    ],
  },
  {
    section: 'content',
    items: [
      {
        type: 'link',
        label: 'Sliders & Banners',
        icon: SlidersHorizontal,
        path: '/admin/sliders-banners',
        permission: 'sliders-banners',
      },
      {
        type: 'link',
        label: 'Terms & Policies',
        icon: FileText,
        path: '/admin/terms-policies',
        permission: 'about_terms-policies',
      },
      {
        type: 'link',
        label: 'FAQs',
        icon: HelpCircle,
        path: '/admin/faqs',
        permission: 'faqs',
      },
      {
        type: 'link',
        label: 'About Us',
        icon: Info,
        path: '/admin/about-us',
        permission: 'about_terms-policies',
      },
    ],
  },
  {
    section: 'system',
    items: [
      {
        type: 'link',
        label: 'System Users',
        icon: ShieldCheck,
        path: '/admin/adminlist',
        permission: 'admin-users',
      },
    ],
  },
];

function MenuItem({ item, countValue }) {
  const Icon = item.icon;
  const count = item.countKey
    ? countValue[item.countKey]
    : countValue?.[item.showCount];

  return (
    <li>
      <Link
        to={item.path}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
      >
        {Icon && <Icon className={ICON_CLASS} />}
        <span>{item.label}</span>
        {count !== undefined && (
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}

function MenuAccordion({ item, countValue, expanded, onChange }) {
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={onChange}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors text-left"
      >
        {Icon && <Icon className={ICON_CLASS} />}
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={`${ICON_CLASS} transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <ul className="space-y-2 pl-4 pt-1">
          {item.items.map((subItem, idx) => (
            <MenuItem key={idx} item={subItem} countValue={countValue} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SidebarMenu() {
  const { allProductsCount, fetchProductsCount } = useProductStore();
  const { logout } = useAuthAdminStore();
  const { totalByStatus, fetchAllStatusCounts } = useOrderStore();

  useEffect(() => {
    fetchProductsCount();
    fetchAllStatusCounts();
  }, [fetchProductsCount, fetchAllStatusCounts]);

  const totalOrders = Object.values(totalByStatus).reduce(
    (acc, count) => acc + count,
    0,
  );

  const countValues = {
    allProductsCount,
    totalOrders,
  };

  const [expandedSections, setExpandedSections] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAccordionChange = useCallback(
    (label) => () => {
      setExpandedSections((prev) => {
        const isExpanded = prev.includes(label);
        const next = isExpanded
          ? prev.filter((l) => l !== label)
          : [...prev, label];
        localStorage.setItem('sidebar-expanded', JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="p-4">
      <ul>
        {MENU_CONFIG.map((section, sectionIdx) => {
          const singleItem = section.items?.length === 1 && !section.label;

          if (section.items.length === 0) return null;

          if (singleItem) {
            const item = section.items[0];
            const Icon = item.icon;
            const count =
              item.showCount !== undefined
                ? countValues[item.showCount]
                : undefined;

            return (
              <RequirePermission
                key={sectionIdx}
                permission={item.permission}
                fallback={true}
              >
                <li>
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                  >
                    {Icon && <Icon className={ICON_CLASS} />}
                    <span>{item.label}</span>
                    {count !== undefined && (
                      <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              </RequirePermission>
            );
          }

          if (section.label) {
            return (
              <RequirePermission
                key={sectionIdx}
                permission={section.permission}
                match={section.match}
                fallback={true}
              >
                <li>
                  <MenuAccordion
                    item={section}
                    countValue={countValues}
                    expanded={expandedSections.includes(section.label)}
                    onChange={handleAccordionChange(section.label)}
                  />
                </li>
              </RequirePermission>
            );
          }

          return (
            <React.Fragment key={sectionIdx}>
              {section.items.map((item, itemIdx) => (
                <RequirePermission
                  key={`${sectionIdx}-${itemIdx}`}
                  permission={item.permission}
                  fallback={true}
                >
                  <li>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                    >
                      {item.icon && <item.icon className={ICON_CLASS} />}
                      <span>{item.label}</span>
                      {item.showCount &&
                        countValues[item.showCount] !== undefined && (
                          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {countValues[item.showCount]}
                          </span>
                        )}
                    </Link>
                  </li>
                </RequirePermission>
              ))}
            </React.Fragment>
          );
        })}
      </ul>

      <li>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-red-500 hover:bg-white/5 transition-colors mt-4"
        >
          <LogOut className={ICON_CLASS} />
          <span>Logout</span>
        </button>
      </li>
    </div>
  );
}
