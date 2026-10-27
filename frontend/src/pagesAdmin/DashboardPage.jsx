import React, { lazy, Suspense, useEffect } from 'react';
import RequirePermission from '../component/componentAdmin/RequirePermission.jsx';
import useBreadcrumbStore from '../store/BreadcrumbStore.js';
import useOrderStore from '../store/useOrderStore.js';
import { Skeleton } from '@/components/ui/skeleton';

const OrdersPieChart = lazy(
  () => import('../component/componentAdmin/OrdersPieChart.jsx'),
);
const DailyOrdersChart = lazy(
  () => import('../component/componentAdmin/DailyOrdersChart.jsx'),
);
const MostSoldProductsChart = lazy(
  () => import('../component/componentAdmin/MostSoldProductsChart.jsx'),
);
const MonthlyRevenueChart = lazy(
  () => import('../component/componentAdmin/MonthlyRevenueChart.jsx'),
);
const MonthlyOrderStatusRatioChart = lazy(
  () => import('../component/componentAdmin/MonthlyOrderStatusRatioChart.jsx'),
);

const ChartFallback = () => (
  <div className="h-64 flex items-center justify-center">
    <Skeleton className="h-full w-full rounded-lg" />
  </div>
);

const DashboardPage = () => {
  const setBreadcrumb = useBreadcrumbStore((s) => s.setBreadcrumb);
  useEffect(() => {
    setBreadcrumb('WEBSITE CONFIG', 'Dashboard');
  }, []);

  const { fetchAllOrders } = useOrderStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchAllOrders(),
          fetchAllOrders('pending'),
          fetchAllOrders('approved'),
          fetchAllOrders('intransit'),
          fetchAllOrders('delivered'),
          fetchAllOrders('returned'),
          fetchAllOrders('cancelled'),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <RequirePermission permission="dashboard">
        <div className={'flex flex-col gap-8'}>
          <div className={'grid md:grid-cols-2 gap-4'}>
            <Suspense fallback={<ChartFallback />}>
              <OrdersPieChart />
            </Suspense>
            <Suspense fallback={<ChartFallback />}>
              <MostSoldProductsChart />
            </Suspense>
          </div>
          <Suspense fallback={<ChartFallback />}>
            <DailyOrdersChart />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <MonthlyRevenueChart />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <MonthlyOrderStatusRatioChart />
          </Suspense>
        </div>
      </RequirePermission>
    </div>
  );
};

export default DashboardPage;
