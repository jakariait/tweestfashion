import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import TagManager from 'react-gtm-module';

import useColorStore from './store/ColorStore.js';
import GeneralInfoStore from './store/GeneralInfoStore.js';
import CategoryStore from './store/useCategoryStore.js';
import SubCategoryStore from './store/useSubCategoryStore.js';
import useSocialMediaLinkStore from './store/SocialMediaLinkStore.js';
import useChildCategoryStore from './store/useChildCategoryStore.js';
import useAuthUserStore from './store/AuthUserStore.js';
import Layout from './component/componentGeneral/Layout.jsx';
import ProtectedRoute from './component/componentAdmin/ProtectedRoute.jsx';
import UserProtectedRoute from './component/componentGeneral/UserProtectedRoute.jsx';
import ScrollToTop from './component/componentGeneral/ScrollToTop.jsx';
import MetaProvider from './component/componentGeneral/MetaProvider.jsx';
import ScrollToTopButton from './component/componentGeneral/ScrollToTopButton.jsx';
import { setFaviconFromApi } from './utils/setFavicon.js';
import Loading from './component/skeleton/Loading.jsx';
import AdminLoading from './component/skeleton/AdminLoading.jsx';

import UserLayout from './component/componentGeneral/UserLayout.jsx';
import CustomerFeedbackPage from '@/pagesAdmin/CustomerFeedbackPage.jsx';
import BrandsPage from '@/pagesAdmin/BrandsPage.jsx';
import BrandsPageUser from '@/pagesUser/BrandsPageUser.jsx';
const LayoutAdmin = lazy(
  () => import('./component/componentAdmin/LayoutAdmin.jsx'),
);

const GeneralInfoPage = lazy(() => import('./pagesAdmin/GeneralInfoPage.jsx'));
const HomePage = lazy(() => import('./pagesUser/HomePage.jsx'));
const SubscribedUsersPage = lazy(
  () => import('./pagesAdmin/SubscribedUsersPage.jsx'),
);
const SliderBannerPage = lazy(
  () => import('./pagesAdmin/SliderBannerPage.jsx'),
);
const ColorUpdaterPage = lazy(
  () => import('./pagesAdmin/ColorUpdaterPage.jsx'),
);
const SocialLinkUpdaterPage = lazy(
  () => import('./pagesAdmin/SocialLinkUpdaterPage.jsx'),
);
const ContactUsPage = lazy(() => import('./pagesUser/ContactUsPage.jsx'));
const ContactRequestPage = lazy(
  () => import('./pagesAdmin/ContactRequestPage.jsx'),
);
const AdminLogin = lazy(
  () => import('./component/componentAdmin/AdminLogin.jsx'),
);
const NotFoundPage = lazy(() => import('./pagesUser/NotFoundPage.jsx'));
const ProductFlagPage = lazy(() => import('./pagesAdmin/ProductFlagPage.jsx'));
const ShopPage = lazy(() => import('./pagesUser/ShopPage.jsx'));
const AddNewProductPage = lazy(
  () => import('./pagesAdmin/AddNewProductPage.jsx'),
);
const ProductDetailsPage = lazy(
  () => import('./pagesUser/ProductDetailsPage.jsx'),
);
const ViewAllProductPage = lazy(
  () => import('./pagesAdmin/ViewAllProductPage.jsx'),
);
const EditProductPage = lazy(() => import('./pagesAdmin/EditProductPage.jsx'));
const LoginPage = lazy(() => import('./pagesUser/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pagesUser/RegisterPage.jsx'));
const CustomerListPage = lazy(
  () => import('./pagesAdmin/CustomerListPage.jsx'),
);
const UserHomePage = lazy(() => import('./pagesUser/UserHomePage.jsx'));
const CheckoutPage = lazy(() => import('./pagesUser/CheckoutPage.jsx'));
const DeliveryChargePage = lazy(
  () => import('./pagesAdmin/DeliveryChargePage.jsx'),
);
const ConfigSetupPage = lazy(() => import('./pagesAdmin/ConfigSetupPage.jsx'));
const ThankYouPage = lazy(() => import('./pagesUser/ThankYouPage.jsx'));
const AllOrdersPage = lazy(() => import('./pagesAdmin/AllOrdersPage.jsx'));

const ViewOrderPage = lazy(() => import('./pagesAdmin/ViewOrderPage.jsx'));
const BkashCallbackPage = lazy(
  () => import('./pagesUser/BkashCallbackPage.jsx'),
);
const CouponPage = lazy(() => import('./pagesAdmin/CouponPage.jsx'));
const AboutUsPage = lazy(() => import('./pagesAdmin/AboutUsPage.jsx'));
const TermsPage = lazy(() => import('./pagesAdmin/TermsPage.jsx'));
const AboutUsPageUser = lazy(() => import('./pagesUser/AboutUsPageUser.jsx'));
const TosPage = lazy(() => import('./pagesUser/TosPage.jsx'));
const PrivacyPolicyPage = lazy(
  () => import('./pagesUser/PrivacyPolicyPage.jsx'),
);
const RefundPolicyPage = lazy(() => import('./pagesUser/RefundPolicyPage.jsx'));
const ShippingPolicyPage = lazy(
  () => import('./pagesUser/ShippingPolicyPage.jsx'),
);
const FAQPage = lazy(() => import('./pagesUser/FAQPage.jsx'));
const AdminFAQSPage = lazy(() => import('./pagesAdmin/AdminFAQSPage.jsx'));
const MarqueeAdminPage = lazy(
  () => import('./pagesAdmin/MarqueeAdminPage.jsx'),
);
const AdminMetaPage = lazy(() => import('./pagesAdmin/AdminMetaPage.jsx'));
const GatewayApiPage = lazy(() => import('./pagesAdmin/GatewayApiPage.jsx'));
const DashboardPage = lazy(() => import('./pagesAdmin/DashboardPage.jsx'));
const UserAllOrdersPage = lazy(
  () => import('./pagesUser/UserAllOrdersPage.jsx'),
);
const UserOrderDetailsPage = lazy(
  () => import('./pagesUser/UserOrderDetailsPage.jsx'),
);
const UpdateUserPage = lazy(() => import('./pagesUser/UpdateUserPage.jsx'));
const ChangePasswordPage = lazy(
  () => import('./pagesUser/ChangePasswordPage.jsx'),
);
const AbandonedCartPage = lazy(
  () => import('./pagesAdmin/AbandonedCartPage.jsx'),
);
const TrackOrderPage = lazy(() => import('./pagesUser/TrackOrderPage.jsx'));
const AdminListPage = lazy(() => import('./pagesAdmin/AdminListPage.jsx'));
const CreateAdminPage = lazy(() => import('./pagesAdmin/CreateAdminPage.jsx'));
const EditAdminPage = lazy(() => import('./pagesAdmin/EditAdminPage.jsx'));
const CreateBlogPage = lazy(() => import('./pagesAdmin/CreateBlogPage.jsx'));
const BlogsListPage = lazy(() => import('./pagesAdmin/BlogsListPage.jsx'));
const EditBlogPage = lazy(() => import('./pagesAdmin/EditBlogPage.jsx'));
const BlogsPage = lazy(() => import('./pagesUser/BlogsPage.jsx'));
const BlogDetailsPage = lazy(() => import('./pagesUser/BlogDetailsPage.jsx'));
const ForgetPasswordPage = lazy(
  () => import('./pagesUser/ForgetPasswordPage.jsx'),
);
const ResetPasswordPage = lazy(
  () => import('./pagesUser/ResetPasswordPage.jsx'),
);
const CategoryPage = lazy(() => import('./pagesAdmin/CategoryPage.jsx'));
const SubCategoryPage = lazy(() => import('./pagesAdmin/SubCategoryPage.jsx'));
const ChildCategoryPage = lazy(
  () => import('./pagesAdmin/ChildCategoryPage.jsx'),
);
const ProductOptionsPage = lazy(
  () => import('./pagesAdmin/ProductOptionsPage.jsx'),
);
const WishlistPage = lazy(() => import('./pagesUser/WishlistPage.jsx'));

function App() {
  const { GeneralInfoListRequest, GeneralInfoList } = GeneralInfoStore();
  const { fetchColors, colors } = useColorStore();
  const { fetchSocialMediaLinks } = useSocialMediaLinkStore();
  const { fetchCategories } = CategoryStore();
  const { fetchSubCategories } = SubCategoryStore();
  const { fetchChildCategories } = useChildCategoryStore();
  const { initialize } = useAuthUserStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          GeneralInfoListRequest(),
          fetchColors(),
          fetchSocialMediaLinks(),
          fetchCategories(),
          fetchSubCategories(),
          fetchChildCategories(),
          initialize(),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (colors) {
      document.documentElement.style.setProperty(
        '--primaryColor',
        colors.primaryColor,
      );
      document.documentElement.style.setProperty(
        '--secondaryColor',
        colors.secondaryColor,
      );
      document.documentElement.style.setProperty(
        '--tertiaryColor',
        colors.tertiaryColor,
      );
      document.documentElement.style.setProperty(
        '--accentColor',
        colors.accentColor,
      );
    }
  }, [colors]);

  useEffect(() => {
    const initGTM = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_BASE}/getGTM`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data?.isActive && data?.googleTagManagerId) {
          TagManager.initialize({ gtmId: data.googleTagManagerId });
        }
      } catch {
        // fail silently
      }
    };
    initGTM();
  }, []);

  useEffect(() => {
    if (GeneralInfoList?.Favicon) {
      setFaviconFromApi(GeneralInfoList.Favicon);
    }
  }, [GeneralInfoList?.Favicon]);

  return (
    <Router>
      <MetaProvider />
      <ScrollToTop />
      <ScrollToTopButton />
      <Routes>
        <Route element={<PublicLayoutWrapper />}>
          <Route element={<PublicSuspenseWrapper />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailsPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
            <Route path="/bkash-callback" element={<BkashCallbackPage />} />
            <Route path="/about" element={<AboutUsPageUser />} />
            <Route path="/termofservice" element={<TosPage />} />
            <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
            <Route path="/refundpolicy" element={<RefundPolicyPage />} />
            <Route path="/shippinpolicy" element={<ShippingPolicyPage />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/blog" element={<BlogsPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailsPage />} />
            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/brands" element={<BrandsPageUser />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<UserProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/user/home" element={<UserHomePage />} />
            <Route path="/user/orders" element={<UserAllOrdersPage />} />
            <Route
              path="/user/orders/:orderNo"
              element={<UserOrderDetailsPage />}
            />
            <Route path="/user/manage-profile" element={<UpdateUserPage />} />
            <Route
              path="/user/change-password"
              element={<ChangePasswordPage />}
            />
            <Route path="/user/wishlist" element={<WishlistPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminSuspenseWrapper />}>
            <Route element={<LayoutAdmin />}>
              <Route path="/admin/general-info" element={<GeneralInfoPage />} />
              <Route
                path="/admin/subscribed-users"
                element={<SubscribedUsersPage />}
              />
              <Route
                path="/admin/color-updater"
                element={<ColorUpdaterPage />}
              />
              <Route
                path="/admin/social-link-updater"
                element={<SocialLinkUpdaterPage />}
              />
              <Route
                path="/admin/sliders-banners"
                element={<SliderBannerPage />}
              />
              <Route
                path="/admin/contact-request"
                element={<ContactRequestPage />}
              />
              <Route path="/admin/category" element={<CategoryPage />} />
              <Route path="/admin/subcategory" element={<SubCategoryPage />} />
              <Route
                path="/admin/childcategory"
                element={<ChildCategoryPage />}
              />
              <Route
                path="/admin/product-options"
                element={<ProductOptionsPage />}
              />
              <Route
                path="/admin/product-flags"
                element={<ProductFlagPage />}
              />
              <Route
                path="/admin/addnewproduct"
                element={<AddNewProductPage />}
              />
              <Route
                path="/admin/manage-products"
                element={<ViewAllProductPage />}
              />
              <Route
                path="/admin/edit-product/:slug"
                element={<EditProductPage />}
              />
              <Route path="/admin/customers" element={<CustomerListPage />} />
              <Route
                path="/admin/deliverycharge"
                element={<DeliveryChargePage />}
              />
              <Route path="/admin/configsetup" element={<ConfigSetupPage />} />
              <Route path="/admin/manage-orders" element={<AllOrdersPage />} />
              <Route
                path="/admin/orders/:orderId"
                element={<ViewOrderPage />}
              />
              <Route path="/admin/coupon" element={<CouponPage />} />
              <Route path="/admin/about-us" element={<AboutUsPage />} />
              <Route path="/admin/terms-policies" element={<TermsPage />} />
              <Route path="/admin/faqs" element={<AdminFAQSPage />} />
              <Route path="/admin/scroll-text" element={<MarqueeAdminPage />} />
              <Route path="/admin/homepage-seo" element={<AdminMetaPage />} />
              <Route path="/admin/gateway-api" element={<GatewayApiPage />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/adminlist" element={<AdminListPage />} />
              <Route path="/admin/createadmin" element={<CreateAdminPage />} />
              <Route path="/admin/edit/:id" element={<EditAdminPage />} />
              <Route
                path="/admin/incomplete-order"
                element={<AbandonedCartPage />}
              />
              <Route path="/admin/create-blog" element={<CreateBlogPage />} />
              <Route path="/admin/blogs" element={<BlogsListPage />} />
              <Route path="/admin/blogs/:id" element={<EditBlogPage />} />

              <Route
                path="/admin/customer-feedback"
                element={<CustomerFeedbackPage />}
              />
              <Route path="/admin/brands" element={<BrandsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

const PublicLayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const PublicSuspenseWrapper = () => (
  <Suspense fallback={<Loading />}>
    <Outlet />
  </Suspense>
);

const AdminSuspenseWrapper = () => (
  <Suspense fallback={<AdminLoading />}>
    <Outlet />
  </Suspense>
);

export default App;
