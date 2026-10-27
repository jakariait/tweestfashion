import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const PermissionsCheckboxGroup = ({
  selectedPermissions = [],
  setSelectedPermissions,
}) => {
  const PERMISSION_OPTIONS = [
    { value: 'dashboard', label: 'Dashboard Access' },
    { value: 'general_info', label: 'General Info' },
    { value: 'website_theme_color', label: 'Website Theme Color' },
    { value: 'social_media_link', label: 'Social Media Links' },
    { value: 'home_page_seo', label: 'Home Page SEO' },
    { value: 'setup_config', label: 'Configuration Setup' },
    { value: 'product_size', label: 'Product Options' },
    { value: 'product_flag', label: 'Product Flag' },
    { value: 'scroll_text', label: 'Scroll Text' },
    { value: 'delivery_charges', label: 'Delivery Charges' },
    { value: 'manage_coupons', label: 'Manage Coupons' },
    { value: 'category', label: 'Category' },
    { value: 'sub_category', label: 'Sub Category' },
    { value: 'child_category', label: 'Child Category' },
    { value: 'add_products', label: 'Add Products' },
    { value: 'delete_products', label: 'Delete Products' },
    { value: 'view_products', label: 'View Products' },
    { value: 'edit_products', label: 'Edit Products' },
    { value: 'view_orders', label: 'View Orders' },
    { value: 'edit_orders', label: 'Edit Orders' },
    { value: 'delete_orders', label: 'Delete Orders' },
    { value: 'incomplete_orders', label: 'Incomplete Orders' },
    { value: 'delete_incomplete_orders', label: 'Delete Incomplete Orders' },
    { value: 'edit_incomplete_orders', label: 'Edit Incomplete Orders' },
    { value: 'bkash_api', label: 'bKash API' },
    { value: 'steadfast_api', label: 'Steadfast API' },
    { value: 'view_customers', label: 'View Customers' },
    { value: 'delete_customers', label: 'Delete Customers' },
    { value: 'contact_request', label: 'Contact Request' },
    { value: 'subscribed_users', label: 'Subscribed Users' },
    { value: 'sliders-banners', label: 'Sliders Banners' },
    { value: 'about_terms-policies', label: 'About Us & Terms & Policies' },
    { value: 'faqs', label: 'FAQs' },
    { value: 'admin-users', label: 'Admin Users' },
    { value: 'blogs', label: 'Blogs' },
    { value: 'pathao_api', label: 'Pathao API' },
    { value: 'customer_feedback', label: 'Customer Feedback' },
    { value: 'brands', label: 'Brands' },
  ];

  const handleChange = (value) => {
    if (selectedPermissions.includes(value)) {
      setSelectedPermissions(
        selectedPermissions.filter((perm) => perm !== value),
      );
    } else {
      setSelectedPermissions([...selectedPermissions, value]);
    }
  };

  const selectAll = () => {
    setSelectedPermissions(PERMISSION_OPTIONS.map((p) => p.value));
  };

  const removeAll = () => {
    setSelectedPermissions([]);
  };

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-lg font-semibold tracking-tight">
        Admin Permissions
      </h2>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <span className="text-sm text-muted-foreground">Permission Routes</span>
        <Button
          variant="outline"
          size="sm"
          onClick={removeAll}
          className="text-destructive hover:text-destructive"
        >
          Remove All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PERMISSION_OPTIONS.map((perm) => (
          <label
            key={perm.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={selectedPermissions.includes(perm.value)}
              onCheckedChange={() => handleChange(perm.value)}
            />
            <span className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {perm.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PermissionsCheckboxGroup;
