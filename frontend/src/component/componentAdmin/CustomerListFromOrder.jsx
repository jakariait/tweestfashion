import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Phone,
  Mail,
  MapPin,
  User,
  ShoppingBag,
  Loader2,
  Download,
} from 'lucide-react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import useAuthAdminStore from '../../store/AuthAdminStore';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';

const statusVariantMap = {
  pending: 'warning',
  approved: 'info',
  intransit: 'default',
  delivered: 'success',
  returned: 'destructive',
  cancelled: 'destructive',
};

const CustomerListFromOrder = () => {
  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/orders/customers`, {
        params: { search: committedSearch, page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.customers || []);
      setTotalCustomers(res.data.totalCustomers);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [committedSearch, page, limit, token, apiUrl]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    setCommittedSearch(search);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleExportCsv = () => {
    const headers = [
      'SL No',
      'Name',
      'Email',
      'Phone',
      'Address',
      'Total Orders',
      'Total Spent',
      'Last Order Date',
    ];

    const escapeCsv = (field) => {
      if (field === null || field === undefined) return '';
      let str = String(field);
      str = str.replace(/"/g, '""');
      if (str.search(/("|,|\n)/g) >= 0) str = `"${str}"`;
      return str;
    };

    const csvHeader = headers.map(escapeCsv).join(',');
    const csvRows = customers.map((cus, index) => {
      const row = [
        index + 1,
        cus.fullName || 'N/A',
        cus.email || 'N/A',
        cus.phone || 'N/A',
        cus.address || 'N/A',
        cus.orderCount || 0,
        cus.totalSpent ? `৳${cus.totalSpent.toLocaleString()}` : 'N/A',
        cus.lastOrderDate
          ? new Date(cus.lastOrderDate).toLocaleDateString()
          : 'N/A',
      ];
      return row.map(escapeCsv).join(',');
    });

    const csvData = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'customers_from_orders.csv');
  };

  const handleViewOrders = async (customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    setOrderDialogOpen(true);
    try {
      const res = await axios.get(
        `${apiUrl}/orders/customer/${encodeURIComponent(customer.phone)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCustomerOrders(res.data.orders || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to fetch customer orders',
      );
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={'Customers from Orders'} />

      <div className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="size-4 mr-1" />
            Export CSV
          </Button>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Show
            </p>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">entries</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">SL</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Orders
                </TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No customers found from orders.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((cus, index) => (
                  <TableRow key={cus.phone}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground shrink-0" />
                        {cus.fullName || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cus.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground shrink-0" />
                          {cus.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground shrink-0" />
                        {cus.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {cus.address ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{cus.address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <Badge variant="secondary">{cus.orderCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrders(cus)}
                      >
                        <Eye className="size-4 mr-1" />
                        Orders
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Orders for {selectedCustomer?.fullName || selectedCustomer?.phone}
            </DialogTitle>
          </DialogHeader>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : customerOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No orders found.
            </p>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <Card
                  key={order._id}
                  className="border-0 shadow-sm bg-muted/20 border-l-4 border-l-primary/60"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            #{order.orderNo}
                          </span>
                          <Badge
                            variant={
                              statusVariantMap[order.orderStatus] || 'default'
                            }
                          >
                            {order.orderStatus}
                          </Badge>
                          <Badge
                            variant={
                              order.paymentStatus === 'paid'
                                ? 'success'
                                : 'secondary'
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ৳{order.totalAmount?.toLocaleString()}
                        </p>
                        {order.dueAmount > 0 && (
                          <p className="text-xs text-destructive">
                            Due: ৳{order.dueAmount?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="size-3" />
                        {order.items?.length || 0} item(s)
                      </span>
                      <span>-</span>
                      <span>{order.paymentMethod?.replace(/_/g, ' ')}</span>
                      {order.deliveryMethod && (
                        <>
                          <span>-</span>
                          <span>
                            {order.deliveryMethod?.replace(/_/g, ' ')}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-3 border-t pt-2 space-y-1">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {item.productId?.images?.[0] ? (
                              <ImageComponent
                                imageName={item.productId.images[0]}
                                className="size-8 rounded object-cover shrink-0"
                                skeletonHeight={32}
                                altName={item.productId.name}
                              />
                            ) : (
                              <div className="size-8 rounded bg-muted shrink-0" />
                            )}
                            <span className="truncate font-medium text-foreground">
                              {item.productId?.name || 'Unknown Product'}
                            </span>
                            {item.variantId?.attributes?.length > 0 && (
                              <span className="text-muted-foreground shrink-0">
                                (
                                {item.variantId.attributes
                                  .map((a) => a.value)
                                  .join(', ')}
                                )
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-muted-foreground">
                              x{item.quantity}
                            </span>
                            <span className="font-medium text-foreground w-16 text-right">
                              ৳{item.price?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerListFromOrder;
