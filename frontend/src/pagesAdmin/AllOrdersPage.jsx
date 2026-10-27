import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AllOrders from '../component/componentAdmin/AllOrders.jsx';
import OrderStats from '../component/componentAdmin/OrderStats.jsx';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import AdminNewOrderCreate from '../component/componentAdmin/AdminNewOrderCreate.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';

const STATUS_LABELS = {
  pending: 'Pending Orders',
  approved: 'Approved Orders',
  intransit: 'In Transit Orders',
  delivered: 'Delivered Orders',
  returned: 'Returned Orders',
  cancelled: 'Cancelled Orders',
};

const AllOrdersPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);

  const title = status ? STATUS_LABELS[status] || 'All Orders' : 'All Orders';

  useEffect(() => {
    setBreadcrumb('ORDERS', `View ${title}`);
  }, [title]);

  return (
    <RequirePermission permission="view_orders">
      <div className="flex items-center justify-center">
        <AdminNewOrderCreate />
      </div>
      <OrderStats />
      <AllOrders title={title} status={status} />
    </RequirePermission>
  );
};

export default AllOrdersPage;
