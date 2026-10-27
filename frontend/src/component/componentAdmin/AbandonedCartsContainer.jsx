import { useCallback, useEffect, useState } from 'react';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import CourierSummery from './CourierSummery.jsx';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  RotateCcw,
  Trash2,
  Pencil,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import RequirePermission from './RequirePermission.jsx';

const AbandonedCartsList = ({
  data,
  onPageChange,
  onDeleteRequest,
  onBulkDeleteRequest,
  onEditRequest,
  onConvertRequest,
  selectedCarts,
  onToggleSelect,
  onSelectAll,
}) => {
  const { totalCount, carts, page, totalPages } = data;
  const allSelected =
    carts.length > 0 && carts.every((cart) => selectedCarts.includes(cart._id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Incomplete Orders ({totalCount})
        </h1>
        {selectedCarts.length > 0 && (
          <RequirePermission
            permission="delete_incomplete_orders"
            fallback={true}
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDeleteRequest(selectedCarts)}
            >
              <Trash2 className="size-3.5 mr-1" />
              Delete Selected ({selectedCarts.length})
            </Button>
          </RequirePermission>
        )}
      </div>

      {carts.length === 0 ? (
        <p className="text-muted-foreground">No Incomplete Orders Found.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => onSelectAll(carts.map((c) => c._id))}
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
          {carts.map((cart) => (
            <Card key={cart._id} className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    checked={selectedCarts.includes(cart._id)}
                    onCheckedChange={() => onToggleSelect(cart._id)}
                    disabled={cart.status === 'converted'}
                    className="mt-1"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 flex-1 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">
                        {cart.fullName || 'Unnamed Customer'}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>
                          <strong>Number:</strong> {cart.number || 'N/A'}
                        </p>
                        <p>
                          <strong>Email:</strong> {cart.email || 'N/A'}
                        </p>
                        <p>
                          <strong>Address:</strong> {cart.address || 'N/A'}
                        </p>
                        <div className="mt-1">
                          <Badge
                            variant={
                              cart.status === 'converted'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {cart.status === 'converted'
                              ? 'Converted'
                              : 'Abandoned'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <CourierSummery phone={cart.number} />
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-semibold">
                        Total: Tk.{cart.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cart.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {cart.status !== 'converted' && (
                          <>
                            <RequirePermission
                              permission="edit_incomplete_orders"
                              fallback={true}
                            >
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onEditRequest(cart)}
                              >
                                <Pencil className="size-3 mr-1" />
                                Edit
                              </Button>
                            </RequirePermission>
                            <RequirePermission
                              permission="edit_incomplete_orders"
                              fallback={true}
                            >
                              <Button
                                size="sm"
                                onClick={() => onConvertRequest(cart)}
                              >
                                <ShoppingCart className="size-3 mr-1" />
                                Convert
                              </Button>
                            </RequirePermission>
                          </>
                        )}
                        <RequirePermission
                          permission="delete_incomplete_orders"
                          fallback={true}
                        >
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDeleteRequest(cart._id)}
                          >
                            <Trash2 className="size-3 mr-1" />
                            Delete
                          </Button>
                        </RequirePermission>
                      </div>
                    </div>
                  </div>
                </div>

                {(cart.cartItems || []).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-muted-foreground/10">
                    {(cart.cartItems || []).map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 rounded-md border border-muted-foreground/10 p-2"
                      >
                        <ImageComponent
                          imageName={item.product?.thumbnailImage}
                          altName={item.product?.name}
                          skeletonHeight={50}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-medium">
                            {item.product?.name || '-'}
                          </p>
                          <p className="text-muted-foreground">
                            {item.product?.category || '-'} |{' '}
                            {item.variant?.displayName || 'No variant'}
                          </p>
                          <p className="text-foreground">
                            Tk.{item.price?.toFixed(2) || '0.00'} ×{' '}
                            {item.quantity} ={' '}
                            <span className="font-semibold">
                              Tk.
                              {(
                                (item.price || 0) * (item.quantity || 0)
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No items in cart.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EditCartDialog = ({ open, cart, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    number: '',
    email: '',
    address: '',
    totalAmount: 0,
  });

  useEffect(() => {
    if (cart) {
      setFormData({
        fullName: cart.fullName || '',
        number: cart.number || '',
        email: cart.email || '',
        address: cart.address || '',
        totalAmount: cart.totalAmount || 0,
      });
    }
  }, [cart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalAmount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = () => {
    onSave(cart._id, formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Abandoned Cart</DialogTitle>
          <DialogDescription>
            Update the customer details for this cart.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Number</label>
            <Input
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Amount</label>
            <Input
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ConvertToOrderDialog = ({
  open,
  cart,
  onClose,
  onConvert,
  shippingOptions,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    number: '',
    email: '',
    address: '',
    shippingId: '',
    paymentMethod: 'cash_on_delivery',
    specialDiscount: 0,
  });

  useEffect(() => {
    if (cart) {
      setFormData({
        fullName: cart.fullName || '',
        number: cart.number || '',
        email: cart.email || '',
        address: cart.address || '',
        shippingId: shippingOptions[0]?._id || '',
        paymentMethod: 'cash_on_delivery',
        specialDiscount: 0,
      });
    }
  }, [cart, shippingOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.shippingId) {
      toast.warning('Please select a shipping method');
      return;
    }
    onConvert(cart._id, formData);
  };

  const isFormValid =
    formData.fullName.trim() && formData.address.trim() && formData.shippingId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Order</DialogTitle>
          <DialogDescription>
            Create an order from this abandoned cart. Stock will be deducted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {!formData.fullName.trim() && (
              <p className="text-xs text-destructive">Full Name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Number</label>
            <Input
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Address <span className="text-destructive">*</span>
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              required
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
            {!formData.address.trim() && (
              <p className="text-xs text-destructive">Address is required</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Method</label>
            <Select
              value={formData.shippingId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, shippingId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shipping method" />
              </SelectTrigger>
              <SelectContent>
                {shippingOptions.map((option) => (
                  <SelectItem key={option._id} value={option._id}>
                    {option.name} - Tk.{option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_on_delivery">
                  Cash on Delivery
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Discount</label>
            <Input
              name="specialDiscount"
              type="number"
              value={formData.specialDiscount}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AbandonedCartsContainer = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [data, setData] = useState({
    totalCount: 0,
    carts: [],
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);

  const [stats, setStats] = useState({
    totalCount: 0,
    abandonedCount: 0,
    convertedCount: 0,
    ratio: 0,
  });

  const [sort, setSort] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedCarts, setSelectedCarts] = useState([]);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState(null);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCart, setEditingCart] = useState(null);

  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [convertingCart, setConvertingCart] = useState(null);

  const fetchAbandonedCarts = useCallback(
    async (page = 1, limit = 10, filterStatus = null, search = '') => {
      try {
        setLoading(true);
        const currentStatus =
          filterStatus !== null ? filterStatus : statusFilter;
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sort,
          status: currentStatus,
        });

        if (search) params.append('search', search);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(
          `${apiUrl}/abandoned-cart?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        if (json.success) {
          setData({
            carts: json.data.carts || [],
            totalCount: json.data.totalCount,
            page,
            limit,
            totalPages: json.data.totalPages,
          });
          setError(null);
          setSelectedCarts([]);
        } else {
          throw new Error(json.message || 'Failed to fetch abandoned carts');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, token, statusFilter, sort, startDate, endDate],
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/abandoned-cart/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [apiUrl, token]);

  const fetchShippingOptions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/getAllShipping`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await response.json();
      if (json.success) {
        setShippingOptions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch shipping options:', err);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchAbandonedCarts(1, itemsPerPage);
    fetchShippingOptions();
    fetchStats();
  }, [itemsPerPage, fetchAbandonedCarts, fetchShippingOptions, fetchStats]);

  const handleToggleSelect = (cartId) => {
    setSelectedCarts((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId],
    );
  };

  const handleSelectAll = (cartIds) => {
    const allSelected = cartIds.every((id) => selectedCarts.includes(id));
    if (allSelected) {
      setSelectedCarts([]);
    } else {
      setSelectedCarts(cartIds);
    }
  };

  const handleDeleteRequest = (cartId) => {
    setSelectedCartId(cartId);
    setOpenDeleteDialog(true);
  };

  const handleBulkDeleteRequest = (cartIds) => {
    setSelectedCartId(cartIds);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const isBulk = Array.isArray(selectedCartId);
      const url = isBulk
        ? `${apiUrl}/abandoned-cart/bulk-delete`
        : `${apiUrl}/abandoned-cart/${selectedCartId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: isBulk ? JSON.stringify({ ids: selectedCartId }) : undefined,
      });

      if (!res.ok) {
        throw new Error('Failed to delete cart(s)');
      }

      const json = await res.json();
      toast.success(json.message);
      setOpenDeleteDialog(false);
      setSelectedCartId(null);
      fetchAbandonedCarts(data.page, itemsPerPage, statusFilter, searchQuery);
      fetchStats();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleEditRequest = (cart) => {
    setEditingCart(cart);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async (cartId, updateData) => {
    try {
      const res = await fetch(`${apiUrl}/abandoned-cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error('Failed to update cart');
      }

      const json = await res.json();
      toast.success(json.message);
      setOpenEditDialog(false);
      setEditingCart(null);
      fetchAbandonedCarts(data.page, itemsPerPage, statusFilter, searchQuery);
      fetchStats();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleConvertRequest = (cart) => {
    setConvertingCart(cart);
    setOpenConvertDialog(true);
  };

  const handleConvertToOrder = async (cartId, orderData) => {
    try {
      const res = await fetch(
        `${apiUrl}/abandoned-cart/${cartId}/convert-to-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        },
      );

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message || 'Failed to convert to order');
      }

      const json = await res.json();
      toast.success(json.message);
      setOpenConvertDialog(false);
      setConvertingCart(null);
      fetchAbandonedCarts(data.page, itemsPerPage, statusFilter, searchQuery);
      fetchStats();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handlePageChange = (newPage) => {
    fetchAbandonedCarts(newPage, itemsPerPage, statusFilter, searchQuery);
  };

  const handleSortChange = (value) => {
    setSort(value);
    fetchAbandonedCarts(1, itemsPerPage, statusFilter, searchQuery);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    fetchAbandonedCarts(1, itemsPerPage, value, searchQuery);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    fetchAbandonedCarts(1, Number(value), statusFilter, searchQuery);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAbandonedCarts(1, itemsPerPage, statusFilter, searchQuery);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    fetchAbandonedCarts(1, itemsPerPage, statusFilter, searchQuery);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    fetchAbandonedCarts(1, itemsPerPage, statusFilter, searchQuery);
  };

  const handleResetFilters = () => {
    setSort('desc');
    setStatusFilter('all');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setItemsPerPage(10);
    fetchAbandonedCarts(1, 10, 'all');
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (error)
    return <p className="text-center mt-10 text-destructive">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-md border-0 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Carts</p>
            <p className="text-2xl font-bold">{stats.totalCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Abandoned</p>
            <p className="text-2xl font-bold">{stats.abandonedCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold">{stats.convertedCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Conversion Ratio</p>
            <p className="text-2xl font-bold">{stats.ratio}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by Date:
            </label>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[130px] h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Status:
            </label>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[130px] h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Search by number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-[180px] h-8 bg-background"
            />
            <Button type="submit" size="sm">
              <Search className="size-3.5 mr-1" />
              Search
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              From:
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-[160px] h-8 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              To:
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-[160px] h-8 bg-background"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              Items per page:
            </label>
            <Select
              value={String(itemsPerPage)}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px] h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AbandonedCartsList
        data={data}
        onPageChange={handlePageChange}
        onDeleteRequest={handleDeleteRequest}
        onBulkDeleteRequest={handleBulkDeleteRequest}
        onEditRequest={handleEditRequest}
        onConvertRequest={handleConvertRequest}
        selectedCarts={selectedCarts}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Abandoned Cart</DialogTitle>
            <DialogDescription>
              {Array.isArray(selectedCartId)
                ? `Are you sure you want to delete ${selectedCartId.length} abandoned cart(s)? This action cannot be undone.`
                : 'Are you sure you want to delete this abandoned cart? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCartDialog
        open={openEditDialog}
        cart={editingCart}
        onClose={() => {
          setOpenEditDialog(false);
          setEditingCart(null);
        }}
        onSave={handleSaveEdit}
        shippingOptions={shippingOptions}
      />

      <ConvertToOrderDialog
        open={openConvertDialog}
        cart={convertingCart}
        onClose={() => {
          setOpenConvertDialog(false);
          setConvertingCart(null);
        }}
        onConvert={handleConvertToOrder}
        shippingOptions={shippingOptions}
      />
    </div>
  );
};

export default AbandonedCartsContainer;
