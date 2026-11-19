import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useOrderStore from '../../store/useOrderStore.js';
import OrderStatusSelector from './OrderStatusSelector.jsx';
import SendToCourierButton from './SendToCourierButton.jsx';
import CourierSummary from '../componentAdmin/CourierSummery.jsx';
import RequirePermission from './RequirePermission.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  PackageSearch,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'In Transit', value: 'intransit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Returned', value: 'returned' },
  { label: 'Cancelled', value: 'cancelled' },
];

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SortableHead = ({
  column,
  label,
  orderBy,
  sortDirection,
  onSort,
  className,
}) => {
  const isActive = orderBy === column;
  return (
    <TableHead
      aria-sort={
        isActive
          ? sortDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      className={cn('h-12', className)}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label}`}
        className="group inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {label}
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="size-3.5" aria-hidden="true" />
          ) : (
            <ArrowDown className="size-3.5" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown
            className="size-3.5 opacity-40 transition-opacity group-hover:opacity-70"
            aria-hidden="true"
          />
        )}
      </button>
    </TableHead>
  );
};

const OrdersLoadingSkeleton = ({ itemsPerPage }) => (
  <div aria-busy="true" aria-live="polite" className="space-y-4">
    <span className="sr-only">Loading orders</span>
    <Card className="overflow-hidden border border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className="max-h-[60vh] overflow-hidden">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {Array.from({ length: 11 }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: itemsPerPage }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 11 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
      <Skeleton className="h-4 w-44" />
      <div className="flex items-center gap-1">
        <Skeleton className="size-11 rounded-md sm:size-9" />
        <Skeleton className="size-11 rounded-md sm:size-9" />
        <Skeleton className="size-11 rounded-md sm:size-9" />
      </div>
    </div>
  </div>
);

const AllOrders = ({
  title = 'All Orders',
  status = '',
  headerActions = null,
  stats = null,
}) => {
  const {
    fetchAllOrders,
    totalOrders,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    searchQuery,
    setSearchQuery,
    orderListByStatus,
    orderListLoading,
    orderListError,
    allOrders: allOrdersFromStore,
    startDate: startDateFromStore,
    endDate: endDateFromStore,
    setDateRange,
    totalByStatus,
    fetchAllStatusCounts,
  } = useOrderStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStatus, setActiveStatus] = useState(
    () => searchParams.get('status') || status,
  );

  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    if (urlStatus !== activeStatus) {
      setActiveStatus(urlStatus);
    }
  }, [activeStatus, searchParams]);

  const handleTabChange = useCallback(
    (newStatus) => {
      setActiveStatus(newStatus);
      setSearchParams(newStatus ? { status: newStatus } : {}, {
        replace: true,
      });
    },
    [setSearchParams],
  );

  const allOrdersTotal = useMemo(
    () =>
      Object.values(totalByStatus || {}).reduce(
        (sum, count) => sum + (count || 0),
        0,
      ),
    [totalByStatus],
  );

  const allOrders = useMemo(
    () =>
      activeStatus
        ? orderListByStatus[activeStatus] || []
        : allOrdersFromStore || [],
    [activeStatus, orderListByStatus, allOrdersFromStore],
  );

  const [sortDirection, setSortDirection] = useState('desc');
  const [orderBy, setOrderBy] = useState('orderNo');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [localStartDate, setLocalStartDate] = useState(
    startDateFromStore || '',
  );
  const [localEndDate, setLocalEndDate] = useState(endDateFromStore || '');

  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkCourierDialog, setBulkCourierDialog] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [sendingToCourier, setSendingToCourier] = useState(false);
  const [downloadingOrders, setDownloadingOrders] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    setCurrentPage(1);
    setSearchInput('');
    setSearchQuery('');
    setLocalStartDate('');
    setLocalEndDate('');
    setDateRange(null, null);
    setSelectedOrders([]);
  }, [activeStatus, setSearchQuery, setDateRange]);

  const fetchOrders = useCallback(() => {
    fetchAllOrders(activeStatus, currentPage, itemsPerPage);
    fetchAllStatusCounts();
  }, [
    activeStatus,
    currentPage,
    itemsPerPage,
    fetchAllOrders,
    fetchAllStatusCounts,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [
    fetchOrders,
    searchQuery,
    currentPage,
    itemsPerPage,
    activeStatus,
    startDateFromStore,
    endDateFromStore,
  ]);

  const handleSearchInputChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handleSearchExecute = useCallback(() => {
    const trimmedSearch = searchInput.trim();
    if (trimmedSearch !== searchQuery) {
      setSearchQuery(trimmedSearch);
      setCurrentPage(1);
    }
  }, [searchInput, searchQuery, setSearchQuery]);

  const handleDateFilter = () => {
    setDateRange(localStartDate, localEndDate);
  };

  const handleClearDateFilter = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setDateRange(null, null);
  };

  const handleSearchKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchExecute();
      }
    },
    [handleSearchExecute],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  }, [setSearchQuery]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback(
    (value) => {
      setItemsPerPage(value);
      setCurrentPage(1);
    },
    [setItemsPerPage],
  );

  const handleSortRequest = useCallback(
    (property) => {
      setSortDirection((prev) => {
        const isAsc = orderBy === property && prev === 'asc';
        return isAsc ? 'desc' : 'asc';
      });
      setOrderBy(property);
    },
    [orderBy],
  );

  const sortedOrders = useMemo(() => {
    const compare = (a, b) => {
      let aVal, bVal;

      switch (orderBy) {
        case 'orderNo':
          aVal = a.orderNo;
          bVal = b.orderNo;
          break;
        case 'orderDate':
          aVal = a.orderDate ? new Date(a.orderDate) : new Date(0);
          bVal = b.orderDate ? new Date(b.orderDate) : new Date(0);
          break;
        case 'totalAmount':
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case 'shippingInfo.fullName':
          aVal = a.shippingInfo?.fullName ?? '';
          bVal = b.shippingInfo?.fullName ?? '';
          break;
        case 'shippingInfo.mobileNo':
          aVal = a.shippingInfo?.mobileNo ?? '';
          bVal = b.shippingInfo?.mobileNo ?? '';
          break;
        case 'orderStatus':
          aVal = a.orderStatus;
          bVal = b.orderStatus;
          break;
        case 'orderSource':
          aVal = a.orderSource;
          bVal = b.orderSource;
          break;
        case 'paymentStatus':
          aVal = a.paymentStatus;
          bVal = b.paymentStatus;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    };

    return [...allOrders].sort(compare);
  }, [allOrders, orderBy, sortDirection]);

  const { startEntry, endEntry } = useMemo(
    () => ({
      startEntry: (currentPage - 1) * itemsPerPage + 1,
      endEntry: Math.min(currentPage * itemsPerPage, totalOrders),
    }),
    [currentPage, itemsPerPage, totalOrders],
  );

  const paginationItems = useMemo(() => {
    const pages = [];
    const delta = 1;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let page = left; page <= right; page += 1) pages.push(page);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  const handleView = useCallback(
    (orderId) => {
      navigate(`/admin/orders/${orderId}`);
    },
    [navigate],
  );

  const handleRetry = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmDelete = useCallback(async () => {
    setDeletingOrder(true);
    try {
      const response = await axios.delete(`${apiUrl}/orders/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to delete order');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting order');
    } finally {
      setDeletingOrder(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  }, [deleteId, apiUrl, token, fetchOrders]);

  const handleSuccess = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDownloadOrders = useCallback(async () => {
    setDownloadingOrders(true);
    try {
      const response = await axios.get(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 10000,
          page: 1,
          ...(activeStatus && { orderStatus: activeStatus }),
          ...(searchQuery && { search: searchQuery }),
        },
      });

      const ordersToDownload = response.data.orders || [];

      if (ordersToDownload.length === 0) {
        toast.warning('No orders to download');
        return;
      }

      const headers = [
        'Order No',
        'Source',
        'Order Date',
        'Customer Name',
        'Mobile Number',
        'Email',
        'Address',
        'Billed Amount',
      ];

      const rows = ordersToDownload.map((order) => [
        order.orderNo || '',
        order.orderSource || 'web',
        order.orderDate
          ? new Date(order.orderDate).toLocaleDateString()
          : new Date(order.createdAt).toLocaleDateString(),
        order.shippingInfo?.fullName || '',
        order.shippingInfo?.mobileNo || '',
        order.shippingInfo?.email || '',
        order.shippingInfo?.address || '',
        order.totalAmount?.toFixed(2) || '0',
      ]);

      const csvContent = [
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((row) =>
          row
            .map((cell) => `"${cell?.toString().replace(/"/g, '""') || ''}"`)
            .join(','),
        ),
      ].join('\n');

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Orders_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Downloaded ${ordersToDownload.length} orders successfully`,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error downloading orders');
    } finally {
      setDownloadingOrders(false);
    }
  }, [apiUrl, token, activeStatus, searchQuery]);

  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        setSelectedOrders(allOrders.map((order) => order._id));
      } else {
        setSelectedOrders([]);
      }
    },
    [allOrders],
  );

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }
      return [...prev, orderId];
    });
  }, []);

  const handleBulkUpdate = useCallback(async () => {
    if (!bulkNewStatus || selectedOrders.length === 0) return;
    setBulkUpdating(true);
    try {
      const response = await axios.put(
        `${apiUrl}/orders/bulk-update-status`,
        { orderIds: selectedOrders, orderStatus: bulkNewStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success(
          `${response.data.totalUpdated} orders updated successfully`,
        );
        setSelectedOrders([]);
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to update orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating orders');
    } finally {
      setBulkUpdating(false);
      setBulkUpdateDialog(false);
      setBulkNewStatus('');
    }
  }, [bulkNewStatus, selectedOrders, apiUrl, token, fetchOrders]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedOrders.length === 0) return;
    setBulkDeleting(true);
    try {
      const response = await axios.delete(`${apiUrl}/orders/bulk-delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { orderIds: selectedOrders },
      });
      if (response.data.success) {
        toast.success(
          `${response.data.totalDeleted} orders deleted successfully`,
        );
        setSelectedOrders([]);
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to delete orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting orders');
    } finally {
      setBulkDeleting(false);
      setBulkDeleteDialog(false);
    }
  }, [selectedOrders, apiUrl, token, fetchOrders]);

  const handleBulkSendToCourier = useCallback(async () => {
    if (!selectedCourier || selectedOrders.length === 0) return;
    setSendingToCourier(true);
    try {
      const ordersToSend = allOrders
        .filter((order) => selectedOrders.includes(order._id))
        .map((order) => ({
          invoice: order.orderNo,
          recipient_name: order.shippingInfo?.fullName || 'N/A',
          recipient_phone: order.shippingInfo?.mobileNo || '',
          recipient_address: order.shippingInfo?.address || 'N/A',
          cod_amount: String(order.dueAmount || 0),
          note: order.note || '',
        }));

      let response;
      if (selectedCourier === 'steadfast') {
        response = await axios.post(
          `${apiUrl}/steadfast/bulk-order`,
          { data: ordersToSend },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (selectedCourier === 'pathao') {
        response = await axios.post(
          `${apiUrl}/pathao/orders/bulk`,
          { data: ordersToSend },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      if (response.data.status === 'success') {
        const responseData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const successCount = responseData.filter(
          (r) => r.status === 'success',
        ).length;
        const errorCount = responseData.filter(
          (r) => r.status === 'error',
        ).length;

        if (successCount > 0) {
          const updatePromises = responseData
            .filter((r) => r.status === 'success')
            .map((result) => {
              const order = allOrders.find((o) => o.orderNo === result.invoice);
              if (!order) return null;
              const updatePayload = {
                sentToCourier: true,
                orderStatus: 'intransit',
                courierProvider: selectedCourier,
                courierConsignmentId: result.consignment_id,
              };
              return axios.put(`${apiUrl}/orders/${order._id}`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` },
              });
            })
            .filter((p) => p !== null);

          try {
            await Promise.all(updatePromises);
          } catch (updateError) {
            console.error('Error updating orders:', updateError);
          }
        }

        if (
          successCount === 0 &&
          errorCount === 0 &&
          responseData.length === 0
        ) {
          toast.error(
            'All orders were rejected by Steadfast. Check console logs and your Steadfast dashboard for details.',
          );
        } else {
          toast.success(
            `${successCount} orders sent to ${selectedCourier} successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
          );
        }
        setSelectedOrders([]);
        fetchOrders();
      } else {
        toast.error(
          response.data.message || 'Failed to send orders to courier',
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Error sending orders to courier';
      console.error('Bulk courier error:', error);
      toast.error(errorMsg);
    } finally {
      setSendingToCourier(false);
      setBulkCourierDialog(false);
      setSelectedCourier('');
    }
  }, [selectedCourier, selectedOrders, allOrders, apiUrl, token, fetchOrders]);

  const allSelected =
    allOrders.length > 0 && selectedOrders.length === allOrders.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <Badge variant="secondary" className="tabular-nums">
              {totalOrders}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Review, update, and export customer orders.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {headerActions}
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadOrders}
            disabled={downloadingOrders}
            aria-busy={downloadingOrders}
            className="h-11 w-full gap-2 sm:h-10 sm:w-auto"
          >
            {downloadingOrders ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            <span className="sm:hidden">
              {downloadingOrders ? 'Exporting…' : 'Export CSV'}
            </span>
            <span className="hidden sm:inline">
              {downloadingOrders ? 'Downloading…' : 'Download All Orders (CSV)'}
            </span>
          </Button>
        </div>
      </div>

      {stats}

      <div
        role="group"
        aria-label="Filter orders by status"
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STATUS_TABS.map((tab) => {
          const selected = activeStatus === tab.value;
          const count = tab.value
            ? (totalByStatus[tab.value] ?? 0)
            : allOrdersTotal;
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={selected}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                  selected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted-foreground/10 text-muted-foreground',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="order-search" className="sr-only">
                Search orders
              </label>
              <Input
                id="order-search"
                type="search"
                aria-label="Search orders by order number, customer, or phone"
                placeholder="Search by order no, customer, or phone…"
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyPress}
                disabled={orderListLoading}
                className="h-11 bg-background pr-24"
              />
              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="h-9 w-9"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchExecute}
                  disabled={!searchInput.trim()}
                  aria-label="Apply search"
                  className="h-9 w-9"
                >
                  <Search className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label
                htmlFor="orders-per-page"
                className="whitespace-nowrap text-sm font-medium text-muted-foreground"
              >
                Rows
              </label>
              <Select
                value={String(itemsPerPage)}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger
                  id="orders-per-page"
                  aria-label="Items per page"
                  className="h-11 w-20 bg-background sm:h-9"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:items-end">
            <div className="space-y-1.5">
              <label
                htmlFor="orders-start-date"
                className="text-sm font-medium"
              >
                Start date
              </label>
              <Input
                id="orders-start-date"
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="orders-end-date" className="text-sm font-medium">
                End date
              </label>
              <Input
                id="orders-end-date"
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <Button
              type="button"
              onClick={handleDateFilter}
              disabled={!localStartDate && !localEndDate}
              className="h-11"
            >
              Apply dates
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearDateFilter}
              disabled={!localStartDate && !localEndDate}
              className="h-11"
            >
              Clear dates
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchQuery && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <p className="text-muted-foreground">
            {orderListLoading
              ? 'Searching…'
              : `Search results for “${searchQuery}”`}
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={handleClearSearch}
            className="h-11 px-0 text-sm sm:h-8"
          >
            Clear search
          </Button>
        </div>
      )}

      {orderListLoading ? (
        <OrdersLoadingSkeleton itemsPerPage={itemsPerPage} />
      ) : orderListError ? (
        <Card className="border border-destructive/30 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Could not load orders</h2>
              <p role="alert" className="text-sm text-muted-foreground">
                {orderListError}
              </p>
            </div>
            <Button type="button" onClick={handleRetry} className="h-11">
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : allOrders.length === 0 ? (
        <Card className="border border-dashed border-border shadow-none">
          <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageSearch className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-semibold">
                {searchQuery ? 'No matching orders' : 'No orders found'}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try a different search term or clear the search to see all orders.'
                  : 'Orders will appear here once customers place them.'}
              </p>
            </div>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearSearch}
                className="h-11"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {selectedOrders.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <p className="text-sm font-medium tabular-nums">
                {selectedOrders.length} order
                {selectedOrders.length === 1 ? '' : 's'} selected
              </p>
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setBulkUpdateDialog(true)}
                  className="h-11 sm:h-8"
                >
                  Bulk update status
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => setBulkDeleteDialog(true)}
                  className="h-11 sm:h-8"
                >
                  Bulk delete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setBulkCourierDialog(true)}
                  className="h-11 sm:h-8"
                >
                  Send to courier
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedOrders([])}
                  className="h-11 sm:h-8"
                >
                  Clear selection
                </Button>
              </div>
            </div>
          )}

          <Card className="overflow-hidden border border-border/60 shadow-sm">
            <CardContent className="p-0">
              <div
                id="orders-table"
                role="region"
                aria-label="Orders table"
                tabIndex={0}
                className="max-h-[60vh] overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
              >
                <Table className="min-w-[1180px]">
                  <TableHeader>
                    <TableRow className="sticky top-0 z-10 bg-background hover:bg-background">
                      <TableHead className="h-12 w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label={
                            allSelected
                              ? 'Deselect all orders'
                              : 'Select all orders'
                          }
                          className="relative size-5 before:absolute before:-inset-3 before:content-['']"
                        />
                      </TableHead>
                      <SortableHead
                        column="orderNo"
                        label="Order No"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                      />
                      <SortableHead
                        column="orderDate"
                        label="Order Date & Time"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                      />
                      <SortableHead
                        column="shippingInfo.fullName"
                        label="Customer"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                      />
                      <SortableHead
                        column="shippingInfo.mobileNo"
                        label="Mobile No"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                      />
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Courier
                      </TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Courier Status
                      </TableHead>
                      <SortableHead
                        column="orderStatus"
                        label="Status"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                      />
                      <SortableHead
                        column="orderSource"
                        label="Source"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                      />
                      <SortableHead
                        column="totalAmount"
                        label="Total Amount"
                        orderBy={orderBy}
                        sortDirection={sortDirection}
                        onSort={handleSortRequest}
                        className="text-right"
                      />
                      <TableHead className="h-12 w-24 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrders.map((order) => {
                      const orderDate = order.createdAt || order.orderDate;
                      const isSelected = selectedOrders.includes(order._id);

                      return (
                        <TableRow
                          key={order._id}
                          data-state={isSelected ? 'selected' : undefined}
                          className="transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/60"
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleSelectOrder(order._id)
                              }
                              aria-label={`Select order ${order.orderNo}`}
                              className="relative size-5 before:absolute before:-inset-3 before:content-['']"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm font-medium tabular-nums">
                              #{order.orderNo}
                            </span>
                          </TableCell>
                          <TableCell>
                            {orderDate ? (
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {new Date(orderDate).toLocaleDateString(
                                    undefined,
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    },
                                  )}
                                </span>
                                <span className="text-xs tabular-nums text-muted-foreground">
                                  {new Date(orderDate).toLocaleTimeString(
                                    undefined,
                                    {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    },
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-48">
                            <span className="block truncate font-medium">
                              {order.shippingInfo?.fullName || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {order.shippingInfo?.mobileNo || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <SendToCourierButton
                              orderData={{
                                invoice: order.orderNo,
                                recipient_name: order.shippingInfo?.fullName,
                                recipient_phone: order.shippingInfo?.mobileNo,
                                recipient_address: order.shippingInfo?.address,
                                cod_amount: order.dueAmount ?? 0,
                                note: order.note || '',
                                order_id: order._id,
                                courier_status: order.sentToCourier,
                                items: order.items?.length ?? 0,
                                courierProvider: order.courierProvider,
                              }}
                              onSuccess={handleSuccess}
                            />
                          </TableCell>
                          <TableCell>
                            <CourierSummary
                              phone={order.shippingInfo?.mobileNo}
                            />
                          </TableCell>
                          <TableCell>
                            <OrderStatusSelector
                              orderId={order._id}
                              initialStatus={order.orderStatus}
                              refetchOrders={fetchOrders}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                order.orderSource === 'admin'
                                  ? 'border-primary/20 bg-primary/5 text-primary'
                                  : 'border-border bg-muted text-muted-foreground',
                              )}
                            >
                              {order.orderSource === 'admin' ? 'Admin' : 'Web'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            Tk. {formatAmount(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(order._id)}
                                    aria-label={`View order ${order.orderNo}`}
                                    className="h-11 w-11 sm:h-9 sm:w-9"
                                  >
                                    <Eye
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                              <RequirePermission
                                permission="delete_orders"
                                fallback={true}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setDeleteId(order._id);
                                        setDeleteDialogOpen(true);
                                      }}
                                      aria-label={`Delete order ${order.orderNo}`}
                                      className="h-11 w-11 text-destructive hover:bg-destructive/10 hover:text-destructive sm:h-9 sm:w-9"
                                    >
                                      <Trash2
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </RequirePermission>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              Showing {startEntry} to {endEntry} of {totalOrders} entries
              {searchQuery && ' (filtered)'}
            </p>
            <nav
              aria-label="Orders pagination"
              className="flex items-center justify-center gap-1"
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-11 w-11 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              {paginationItems.map((page, index) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-muted-foreground"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={page}
                    type="button"
                    variant={page === currentPage ? 'default' : 'ghost'}
                    size="icon"
                    className="h-11 w-11 tabular-nums sm:h-9 sm:w-9"
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                    disabled={orderListLoading}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next page"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-11 w-11 sm:h-9 sm:w-9"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingOrder}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingOrder}
              aria-busy={deletingOrder}
              className="h-11 gap-2 sm:h-9"
            >
              {deletingOrder && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {deletingOrder ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkUpdateDialog} onOpenChange={setBulkUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Order Status</DialogTitle>
            <DialogDescription>
              You are about to update {selectedOrders.length} order(s) to a new
              status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label htmlFor="bulk-status" className="text-sm font-medium">
              New Status
            </label>
            <Select value={bulkNewStatus} onValueChange={setBulkNewStatus}>
              <SelectTrigger id="bulk-status" className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="intransit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkUpdateDialog(false)}
              disabled={bulkUpdating}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkUpdate}
              disabled={!bulkNewStatus || bulkUpdating}
              aria-busy={bulkUpdating}
              className="h-11 gap-2 sm:h-9"
            >
              {bulkUpdating && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {bulkUpdating ? 'Updating…' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedOrders.length} order(s)?
              This action cannot be undone and will restore stock for each
              order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDeleteDialog(false)}
              disabled={bulkDeleting}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              aria-busy={bulkDeleting}
              className="h-11 gap-2 sm:h-9"
            >
              {bulkDeleting && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {bulkDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkCourierDialog} onOpenChange={setBulkCourierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to Courier</DialogTitle>
            <DialogDescription>
              You are about to send {selectedOrders.length} order(s) to a
              courier service.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label htmlFor="bulk-courier" className="text-sm font-medium">
              Select Courier
            </label>
            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
              <SelectTrigger id="bulk-courier" className="h-11">
                <SelectValue placeholder="Select courier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steadfast">Steadfast</SelectItem>
                <SelectItem value="pathao">Pathao</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkCourierDialog(false)}
              disabled={sendingToCourier}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkSendToCourier}
              disabled={!selectedCourier || sendingToCourier}
              aria-busy={sendingToCourier}
              className="h-11 gap-2 sm:h-9"
            >
              {sendingToCourier && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {sendingToCourier ? 'Sending…' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;
