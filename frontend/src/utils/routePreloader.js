const preloadedPublic = { done: false };
const preloadedUser = { done: false };

export const preloadPublicRoutes = () => {
  if (preloadedPublic.done) return;
  preloadedPublic.done = true;

  Promise.all([
    import('../pagesUser/HomePage.jsx'),
    import('../pagesUser/ShopPage.jsx'),
    import('../pagesUser/ProductDetailsPage.jsx'),
    import('../pagesUser/CheckoutPage.jsx'),
    import('../pagesUser/LoginPage.jsx'),
    import('../pagesUser/RegisterPage.jsx'),
  ]).catch(() => {});
};

export const preloadUserRoutes = () => {
  if (preloadedUser.done) return;
  preloadedUser.done = true;

  Promise.all([
    import('../pagesUser/UserHomePage.jsx'),
    import('../pagesUser/UserAllOrdersPage.jsx'),
    import('../pagesUser/UpdateUserPage.jsx'),
    import('../pagesUser/WishlistPage.jsx'),
  ]).catch(() => {});
};
