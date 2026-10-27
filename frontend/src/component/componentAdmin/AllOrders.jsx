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
  Search,
  X,
  Eye,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';

const AllOrders = ({ title, status = '' }) => {
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

  const STATUS_TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'In Transit', value: 'intransit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Returned', value: 'returned' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStatus, setActiveStatus] = useState(
    () => searchParams.get('status') || status,
  );

  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    if (urlStatus !== activeStatus) {
      if (urlStatus) {
        setActiveStatus(urlStatus);
      }
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

  const SortHeader = ({ column, label, className }) => {
    const isActive = orderBy === column;
    const direction = isActive ? sortDirection : null;
    return (
      <button
        onClick={() => handleSortRequest(column)}
        className={`inline-flex items-center gap-1 font-medium text-sm hover:text-foreground transition-colors ${className || ''}`}
      >
        {label}
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground/40" />
        )}
      </button>
    );
  };

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

  const handleView = useCallback(
    (orderId) => {
      navigate(`/admin/orders/${orderId}`);
    },
    [navigate],
  );

  const handleConfirmDelete = useCallback(async () => {
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
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
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
        setDownloadingOrders(false);
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
      link.click();
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

  const LoadingSkeleton = useMemo(
    () => (
      <div>
        <Card className="shadow-md border-0 min-h-[60vh]">
          <CardContent className="p-0">
            <div className="h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 z-10 bg-background">
                    {[
                      'Order No',
                      'Order Date & Time',
                      'Customer',
                      'Mobile No',
                      'Courier',
                      'Courier Status',
                      'Status',
                      'Payment Status',
                      'Total Amount',
                      'Source',
                      'Actions',
                    ].map((header, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <TableRow key={index}>
                      {Array(11)
                        .fill()
                        .map((_, cellIndex) => (
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
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 mt-4">
          <Skeleton className="h-4 w-44" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>
    ),
    [itemsPerPage],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${
              activeStatus === tab.value
                ? 'bg-[#00395d] text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeStatus === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-muted-foreground/10 text-muted-foreground'
              }`}
            >
              {tab.value ? (totalByStatus[tab.value] ?? 0) : allOrdersTotal}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h1 className="border-l-4 border-[#00395d] pl-2 text-lg font-semibold text-[#00395d]">
          {title}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadOrders}
          disabled={downloadingOrders}
        >
          <Download className="size-4 mr-1" />
          {downloadingOrders ? 'Downloading...' : 'Download All Orders (CSV)'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4">
        <div className="relative">
          <Input
            placeholder="Search orders..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyPress}
            disabled={orderListLoading}
            className="pr-20 bg-background"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {searchInput && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleClearSearch}
                type="button"
              >
                <X className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleSearchExecute}
              disabled={!searchInput.trim()}
              type="button"
            >
              <Search className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Items per page:
          </p>
          <Select
            value={String(itemsPerPage)}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20 h-8 bg-background">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg bg-muted/30 p-4 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            className="bg-background"
          />
        </div>
        <Button
          onClick={handleDateFilter}
          disabled={!localStartDate && !localEndDate}
        >
          Filter by Date
        </Button>
        <Button
          variant="ghost"
          onClick={handleClearDateFilter}
          disabled={!localStartDate && !localEndDate}
        >
          Clear Dates
        </Button>
      </div>

      {searchQuery && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {orderListLoading
              ? 'Searching...'
              : `Search results for: "${searchQuery}"`}
          </p>
          <Button variant="ghost" size="sm" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      )}

      {orderListLoading ? (
        LoadingSkeleton
      ) : orderListError ? (
        <Card className="border-destructive/50 min-h-[40vh]">
          <CardContent className="py-4 flex items-center justify-center">
            <p className="text-destructive font-medium">{orderListError}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {allOrders.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center justify-center min-h-[calc(60vh_+_72px)]">
              <p className="text-lg text-muted-foreground">
                {searchQuery
                  ? 'No orders found matching your search.'
                  : 'No orders found.'}
              </p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search terms or clear the search to see all
                  orders.
                </p>
              )}
            </div>
          ) : (
            <div>
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg flex-wrap">
                  <p className="text-sm font-medium">
                    {selectedOrders.length} order(s) selected
                  </p>
                  <Button size="sm" onClick={() => setBulkUpdateDialog(true)}>
                    Bulk Update Status
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setBulkDeleteDialog(true)}
                  >
                    Bulk Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setBulkCourierDialog(true)}
                  >
                    Send to Courier
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedOrders([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}

              <Card className="shadow-md border-0">
                <CardContent
                  className="p-0"
                  style={{ opacity: orderListLoading ? 0.6 : 1 }}
                >
                  <div className="h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-background">
                          <TableHead className="w-10">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>
                            <SortHeader column="orderNo" label="Order No" />
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              column="orderDate"
                              label="Order Date & Time"
                            />
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              column="shippingInfo.fullName"
                              label="Customer"
                            />
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              column="shippingInfo.mobileNo"
                              label="Mobile No"
                            />
                          </TableHead>
                          <TableHead>Courier</TableHead>
                          <TableHead>Courier Status</TableHead>
                          <TableHead>
                            <SortHeader column="orderStatus" label="Status" />
                          </TableHead>
                          <TableHead>
                            <SortHeader column="orderSource" label="Source" />
                          </TableHead>
                          <TableHead>
                            <SortHeader
                              column="totalAmount"
                              label="Total Amount"
                            />
                          </TableHead>
                          <TableHead className="text-center w-[100px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedOrders.includes(order._id)}
                                onCheckedChange={() =>
                                  handleSelectOrder(order._id)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {order.orderNo}
                            </TableCell>
                            <TableCell>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString()
                                : ''}
                            </TableCell>
                            <TableCell>
                              {order.shippingInfo?.fullName ?? ''}
                            </TableCell>
                            <TableCell>
                              {order.shippingInfo?.mobileNo ?? ''}
                            </TableCell>
                            <TableCell>
                              <SendToCourierButton
                                orderData={{
                                  invoice: order.orderNo,
                                  recipient_name: order.shippingInfo?.fullName,
                                  recipient_phone: order.shippingInfo?.mobileNo,
                                  recipient_address:
                                    order.shippingInfo?.address,
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
                                refetchOrders={fetchOrders}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.orderSource === 'admin'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {order.orderSource === 'admin'
                                  ? 'Admin'
                                  : 'Web'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              Tk. {order.totalAmount?.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => handleView(order._id)}
                                    >
                                      <Eye className="size-3.5" />
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
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => {
                                          setDeleteId(order._id);
                                          setDeleteDialogOpen(true);
                                        }}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </RequirePermission>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startEntry} to {endEntry} of {totalOrders} entries
                  {searchQuery && ' (filtered)'}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {(() => {
                    const pages = [];
                    const delta = 1;
                    const left = Math.max(2, currentPage - delta);
                    const right = Math.min(totalPages - 1, currentPage + delta);
                    pages.push(1);
                    if (left > 2) pages.push('...');
                    for (let i = left; i <= right; i++) pages.push(i);
                    if (right < totalPages - 1) pages.push('...');
                    if (totalPages > 1) pages.push(totalPages);
                    return pages.map((p, i) =>
                      p === '...' ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-1 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === currentPage ? 'default' : 'ghost'}
                          size="sm"
                          className="min-w-9"
                          disabled={orderListLoading}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      ),
                    );
                  })()}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
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
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
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
            <label className="text-sm font-medium">New Status</label>
            <Select value={bulkNewStatus} onValueChange={setBulkNewStatus}>
              <SelectTrigger>
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
              variant="outline"
              onClick={() => setBulkUpdateDialog(false)}
              disabled={bulkUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={!bulkNewStatus || bulkUpdating}
            >
              {bulkUpdating ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
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
              variant="outline"
              onClick={() => setBulkDeleteDialog(false)}
              disabled={bulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
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
            <label className="text-sm font-medium">Select Courier</label>
            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
              <SelectTrigger>
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
              variant="outline"
              onClick={() => setBulkCourierDialog(false)}
              disabled={sendingToCourier}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSendToCourier}
              disabled={!selectedCourier || sendingToCourier}
            >
              {sendingToCourier ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;
