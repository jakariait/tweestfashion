import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './footer.jsx';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLoading from '../skeleton/AdminLoading.jsx';

const SidebarMenu = lazy(() => import('./SidebarMenu.jsx'));
const Breadcrumb = lazy(() => import('./Breadcrumb.jsx'));

const SidebarFallback = () => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-4 w-3/4 bg-white/10" />
    <Skeleton className="h-4 w-1/2 bg-white/10" />
    <Skeleton className="h-4 w-2/3 bg-white/10" />
    <Skeleton className="h-4 w-3/4 bg-white/10" />
    <Skeleton className="h-4 w-1/2 bg-white/10" />
  </div>
);

const BreadcrumbFallback = () => (
  <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-muted-foreground/10 flex items-center justify-between gap-4 px-4 lg:px-6 py-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="lg:hidden p-1.5 -ml-1">
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton className="h-8 w-8 rounded-full" />
  </div>
);

const LayoutAdmin = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-right" />

      <div className="primaryBgColor accentTextColor hidden lg:block fixed left-0 top-0 h-screen w-65 z-30 border-r border-white/10 overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
        </div>
        <Suspense fallback={<SidebarFallback />}>
          <SidebarMenu />
        </Suspense>
      </div>

      <div className="lg:ml-65 flex flex-col min-h-screen">
        <Suspense fallback={<BreadcrumbFallback />}>
          <Breadcrumb />
        </Suspense>

        <main className="flex flex-1 flex-col p-2 lg:p-2">
          <TooltipProvider>
            <Suspense fallback={<AdminLoading />}>
              <Outlet />
            </Suspense>
          </TooltipProvider>
        </main>

        <footer className="primaryBgColor accentTextColor">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default LayoutAdmin;
