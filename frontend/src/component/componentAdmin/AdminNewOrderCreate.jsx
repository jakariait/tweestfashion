import { useCallback, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Search, Loader2, Package } from 'lucide-react';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import useOrderStore from '../../store/useOrderStore.js';

const formatPrice = (price) => {
  if (isNaN(price)) return price;
  return price.toLocaleString();
};

const calculateDiscountPercentage = (
  priceBeforeDiscount,
  priceAfterDiscount,
) => {
  if (
    !priceBeforeDiscount ||
    !priceAfterDiscount ||
    priceBeforeDiscount <= priceAfterDiscount
  )
    return 0;
  const discountAmount = priceBeforeDiscount - priceAfterDiscount;
  return Math.ceil((discountAmount / priceBeforeDiscount) * 100);
};

const AdminNewOrderCreate = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { fetchAllOrders } = useOrderStore();

  const [openDialog, setOpenDialog] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');

  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    mobileNo: '',
    email: '',
    address: '',
  });

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productSearch, setProductSearch] = useState('');

  const [orderItems, setOrderItems] = useState([]);

  const hasFreeShippingProduct = orderItems.some((item) => item.freeShipping);

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const [adminNote, setAdminNote] = useState('');

  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    vat: 0,
    deliveryCharge: 0,
    total: 0,
  });
  const [vatPercentage, setVatPercentage] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [formErrors, setFormErrors] = useState({
    fullName: false,
    mobileNo: false,
    address: false,
    selectedCustomer: false,
    selectedShipping: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllProductsAdmin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.data?.success) {
        setProducts(res.data.products || []);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch products');
    }
  }, [apiUrl]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllUsers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.data?.success) {
        setCustomers(res.data.users || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch customers');
    }
  }, [apiUrl]);

  const fetchShippingOptions = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllShipping`);
      if (res.data?.success) {
        setShippingOptions(res.data.data || []);
      }
    } catch {
      toast.error('Failed to fetch shipping options');
    }
  }, [apiUrl]);

  const fetchVatPercentage = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/getVatPercentage`);
      if (res.data?.success && res.data.data) {
        const vatValue = res.data.data.percentage || res.data.data.value || 0;
        setVatPercentage(parseFloat(vatValue) || 0);
      } else {
        setVatPercentage(0);
      }
    } catch {
      setVatPercentage(0);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProducts();
    fetchShippingOptions();
    fetchVatPercentage();
  }, [fetchProducts, fetchShippingOptions, fetchVatPercentage]);

  useEffect(() => {
    if (!isGuest) {
      fetchCustomers();
    }
  }, [isGuest, fetchCustomers]);

  const getVariantName = (variant) => {
    if (!variant) return 'Unknown';
    if (variant.attributes && variant.attributes.length > 0) {
      return variant.attributes.map((attr) => attr.value).join(' - ');
    }
    return `Variant ${variant._id.slice(-4)}`;
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase()),
    );
  }, [customers, customerSearch]);

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const hasVariants =
      selectedProduct.variants && selectedProduct.variants.length > 0;

    if (hasVariants && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    if (quantity < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }

    let price, variantId, variantName;

    if (hasVariants) {
      price =
        selectedVariant.discount > 0
          ? selectedVariant.discount
          : selectedVariant.price || 0;
      variantId = selectedVariant._id;
      variantName = getVariantName(selectedVariant);
    } else {
      price =
        selectedProduct.finalDiscount > 0
          ? selectedProduct.finalDiscount
          : selectedProduct.finalPrice || 0;
      variantId = null;
      variantName = 'Default';
    }

    const newItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      variantId,
      variantName,
      quantity: parseInt(quantity),
      price,
      freeShipping: selectedProduct.freeShipping || false,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setProductSearch('');
    toast.success('Product added to order');
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = useCallback(() => {
    const hasFreeShipping = orderItems.some(
      (item) => item.freeShipping === true,
    );

    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );

    const deliveryCharge = hasFreeShipping ? 0 : selectedShipping?.value || 0;
    const discount = parseFloat(specialDiscount) || 0;

    const amountAfterDiscount = subtotal - discount;

    const vatPercent = parseFloat(vatPercentage) || 0;
    const vat = Math.max(0, (amountAfterDiscount * vatPercent) / 100);

    const total = Math.max(0, subtotal + deliveryCharge + vat - discount);

    setCalculatedTotals({
      subtotal: Math.round(subtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      deliveryCharge: Math.round(deliveryCharge * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  }, [orderItems, selectedShipping, specialDiscount, vatPercentage]);

  useEffect(() => {
    calculateTotals();
  }, [
    orderItems,
    selectedShipping,
    specialDiscount,
    vatPercentage,
    calculateTotals,
  ]);

  const handleCreateOrder = async () => {
    try {
      if (orderItems.length === 0) {
        toast.error('Add at least one product to the order');
        return;
      }

      if (!hasFreeShippingProduct && !selectedShipping) {
        toast.error('Please select a shipping option');
        return;
      }

      if (isGuest) {
        if (!guestInfo.fullName?.trim()) {
          toast.error('Full Name is required');
          return;
        }
        if (!guestInfo.mobileNo?.trim()) {
          toast.error('Mobile Number is required');
          return;
        }
        if (!guestInfo.address?.trim()) {
          toast.error('Address is required');
          return;
        }
      } else {
        if (!selectedCustomer) {
          toast.error('Please select a customer');
          return;
        }
        if (!selectedCustomer?.fullName?.trim()) {
          toast.error('Customer Full Name is required');
          return;
        }
        if (!selectedCustomer?.phone?.trim()) {
          toast.error('Customer Mobile Number is required');
          return;
        }
        if (!guestInfo.address?.trim()) {
          toast.error('Address is required');
          return;
        }
      }

      setIsLoading(true);

      const orderData = {
        userId: isGuest ? null : selectedCustomer?._id,
        items: orderItems,
        paymentMethod,
        paymentStatus,
        shippingInfo: isGuest
          ? guestInfo
          : {
              fullName: selectedCustomer?.fullName || '',
              mobileNo: selectedCustomer?.phone || '',
              email: selectedCustomer?.email || '',
              address: guestInfo.address,
            },
        billingInfo: isGuest
          ? guestInfo
          : {
              fullName: selectedCustomer?.fullName || '',
              address: guestInfo.address,
            },
        shippingId: hasFreeShippingProduct
          ? shippingOptions[0]?._id
          : selectedShipping._id,
        deliveryCharge: hasFreeShippingProduct ? 0 : selectedShipping.value,
        subtotalAmount: calculatedTotals.subtotal,
        vat: calculatedTotals.vat,
        specialDiscount: specialDiscount,
        promoCode: promoCode || null,
        promoDiscount: 0,
        adminNote,
        orderSource: 'admin',
      };

      const res = await axios.post(`${apiUrl}/orders/admin/create`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data?.success) {
        toast.success('Order created successfully!');
        fetchAllOrders();
        handleCloseDialog();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOrderItems([]);
    setSelectedCustomer(null);
    setGuestInfo({ fullName: '', mobileNo: '', email: '', address: '' });
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setSpecialDiscount(0);
    setPromoCode('');
    setAdminNote('');
    setPaymentMethod('cash_on_delivery');
    setPaymentStatus('unpaid');
    setProductSearch('');
    setCustomerSearch('');
    setFormErrors({
      fullName: false,
      mobileNo: false,
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
    });
  };

  const validateForm = useCallback(() => {
    const errors = {
      fullName: false,
      mobileNo: false,
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
    };

    if (isGuest) {
      if (!guestInfo.fullName?.trim()) errors.fullName = true;
      if (!guestInfo.mobileNo?.trim()) errors.mobileNo = true;
      if (!guestInfo.address?.trim()) errors.address = true;
    } else {
      if (!selectedCustomer) errors.selectedCustomer = true;
      if (!guestInfo.fullName?.trim()) errors.fullName = true;
      if (!guestInfo.mobileNo?.trim()) errors.mobileNo = true;
      if (!guestInfo.address?.trim()) errors.address = true;
    }

    if (!hasFreeShippingProduct && !selectedShipping)
      errors.selectedShipping = true;

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  }, [
    isGuest,
    guestInfo.fullName,
    guestInfo.mobileNo,
    guestInfo.address,
    selectedCustomer,
    hasFreeShippingProduct,
    selectedShipping,
  ]);

  useEffect(() => {
    if (openDialog) {
      validateForm();
    }
  }, [
    isGuest,
    guestInfo.fullName,
    guestInfo.mobileNo,
    guestInfo.address,
    selectedCustomer,
    selectedShipping,
    orderItems,
    openDialog,
    validateForm,
  ]);

  const hasFormErrors = Object.values(formErrors).some((error) => error);

  return (
    <div>
      <Button onClick={handleOpenDialog}>+ Create New Order</Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create New Admin Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="space-y-2">
                  <Label>Customer Type</Label>
                  <Select
                    value={isGuest ? 'guest' : 'registered'}
                    onValueChange={(value) => setIsGuest(value === 'guest')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest Checkout</SelectItem>
                      <SelectItem value="registered">
                        Registered User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isGuest ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={guestInfo.fullName}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            fullName: e.target.value,
                          })
                        }
                        className={
                          formErrors.fullName ? 'border-destructive' : ''
                        }
                      />
                      {formErrors.fullName && (
                        <p className="text-xs text-destructive">
                          Full Name is required
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label>Mobile Number</Label>
                      <Input
                        value={guestInfo.mobileNo}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            mobileNo: e.target.value,
                          })
                        }
                        className={
                          formErrors.mobileNo ? 'border-destructive' : ''
                        }
                      />
                      {formErrors.mobileNo && (
                        <p className="text-xs text-destructive">
                          Mobile Number is required
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label>Address</Label>
                      <Input
                        value={guestInfo.address}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            address: e.target.value,
                          })
                        }
                        className={
                          formErrors.address ? 'border-destructive' : ''
                        }
                      />
                      {formErrors.address && (
                        <p className="text-xs text-destructive">
                          Address is required
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Customer</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customers..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto border rounded-md">
                        {filteredCustomers.map((cust) => (
                          <button
                            type="button"
                            key={cust._id}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                              selectedCustomer?._id === cust._id
                                ? 'bg-muted font-medium'
                                : ''
                            }`}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setGuestInfo({
                                fullName: cust.fullName || '',
                                mobileNo: cust.phone || '',
                                email: cust.email || '',
                                address: cust.address || '',
                              });
                              setCustomerSearch('');
                            }}
                          >
                            {cust.fullName} ({cust.email})
                          </button>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <p className="px-3 py-2 text-sm text-muted-foreground">
                            No customers found
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedCustomer && (
                      <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                          <p className="text-sm font-medium">
                            Customer Details (Editable)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label>Full Name</Label>
                              <Input
                                value={guestInfo.fullName}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    fullName: e.target.value,
                                  })
                                }
                                className={
                                  formErrors.fullName
                                    ? 'border-destructive'
                                    : ''
                                }
                              />
                              {formErrors.fullName && (
                                <p className="text-xs text-destructive">
                                  Full Name is required
                                </p>
                              )}
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label>Mobile Number</Label>
                              <Input
                                value={guestInfo.mobileNo}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    mobileNo: e.target.value,
                                  })
                                }
                                className={
                                  formErrors.mobileNo
                                    ? 'border-destructive'
                                    : ''
                                }
                              />
                              {formErrors.mobileNo && (
                                <p className="text-xs text-destructive">
                                  Mobile Number is required
                                </p>
                              )}
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={guestInfo.email}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label>Address</Label>
                              <Input
                                value={guestInfo.address}
                                onChange={(e) =>
                                  setGuestInfo({
                                    ...guestInfo,
                                    address: e.target.value,
                                  })
                                }
                                className={
                                  formErrors.address ? 'border-destructive' : ''
                                }
                              />
                              {formErrors.address && (
                                <p className="text-xs text-destructive">
                                  Address is required
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Add Products</h3>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setSelectedProduct(null);
                      setSelectedVariant(null);
                    }}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-100 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {filteredProducts.map((p) => (
                        <button
                          type="button"
                          key={p._id}
                          onClick={() => {
                            setSelectedProduct(p);
                            setSelectedVariant(null);
                          }}
                          className={`relative block w-full text-left transition-all rounded-xl overflow-hidden ${
                            selectedProduct?._id === p._id
                              ? 'ring-2 ring-primary/20 shadow-sm'
                              : 'hover:shadow-sm'
                          }`}
                        >
                          <div className="relative">
                            <ImageComponent
                              imageName={p.thumbnailImage || p.images?.[0]}
                              className="w-full aspect-square object-cover"
                              altName={p.name}
                              skeletonHeight={120}
                            />
                            {(() => {
                              const hasVariants = p.variants?.length > 0;
                              const origPrice = hasVariants
                                ? p.variants[0].price
                                : p.finalPrice;
                              const discPrice = hasVariants
                                ? p.variants[0].discount
                                : p.finalDiscount;
                              const pct = calculateDiscountPercentage(
                                origPrice,
                                discPrice,
                              );
                              return pct > 0 ? (
                                <span className="absolute top-2 left-0 bg-red-400 px-2 py-1 rounded text-white text-xs font-semibold">
                                  -{pct}%
                                </span>
                              ) : null;
                            })()}
                          </div>
                          <div className="p-1.5 text-center">
                            <div className="text-sm font-medium truncate">
                              {p.name}
                            </div>
                            <div className="flex gap-1.5 justify-center mt-0.5">
                              {(() => {
                                const hasVariants = p.variants?.length > 0;
                                const origPrice = hasVariants
                                  ? Number(p.variants[0].price)
                                  : Number(p.finalPrice);
                                const discPrice = hasVariants
                                  ? Number(p.variants[0].discount)
                                  : Number(p.finalDiscount);
                                if (
                                  hasVariants
                                    ? p.variants[0].discount > 0
                                    : p.finalDiscount > 0
                                ) {
                                  return (
                                    <>
                                      <span className="text-xs text-muted-foreground line-through">
                                        Tk. {formatPrice(origPrice)}
                                      </span>
                                      <span className="text-xs text-red-800 font-semibold">
                                        Tk. {formatPrice(discPrice)}
                                      </span>
                                    </>
                                  );
                                }
                                return (
                                  <span className="text-xs text-muted-foreground">
                                    Tk. {formatPrice(origPrice)}
                                  </span>
                                );
                              })()}
                            </div>
                            {p.freeShipping && (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-[9px] leading-none px-1.5 py-0.5"
                              >
                                Free Ship
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                      <Package className="size-8 mb-2 opacity-40" />
                      <p>No products found</p>
                    </div>
                  )}
                </div>

                {selectedProduct && (
                  <div className="flex items-end gap-3 p-3 rounded-xl bg-muted/40">
                    {selectedProduct.variants &&
                      selectedProduct.variants.length > 0 && (
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-xs">Variant</Label>
                          <Select
                            value={selectedVariant?._id || ''}
                            onValueChange={(value) => {
                              const variant = (
                                selectedProduct.variants || []
                              ).find((v) => v._id === value);
                              setSelectedVariant(variant);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProduct.variants.map((variant) => (
                                <SelectItem
                                  key={variant._id}
                                  value={variant._id}
                                >
                                  {getVariantName(variant)} - ৳
                                  {variant.discount > 0
                                    ? variant.discount
                                    : variant.price || 0}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    <div className="w-24 space-y-1.5">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min={1}
                      />
                    </div>
                    <Button onClick={handleAddProduct}>
                      <Plus className="size-4 mr-1" />
                      Add
                    </Button>
                  </div>
                )}

                {orderItems.length > 0 && (
                  <>
                    <h3 className="font-semibold pt-2">Order Items</h3>
                    <div className="rounded-xl bg-muted/40 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center w-16">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {item.productName}
                              </TableCell>
                              <TableCell>{item.variantName}</TableCell>
                              <TableCell className="text-right">
                                ৳{item.price}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ৳{item.price * item.quantity}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Shipping & Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label>Shipping Option</Label>
                    {hasFreeShippingProduct ? (
                      <Input
                        value="Free Shipping"
                        className="text-green-600 font-semibold"
                        readOnly
                      />
                    ) : (
                      <Select
                        value={selectedShipping?._id || ''}
                        onValueChange={(value) => {
                          const shipping = shippingOptions.find(
                            (s) => s._id === value,
                          );
                          setSelectedShipping(shipping);
                        }}
                      >
                        <SelectTrigger
                          className={
                            formErrors.selectedShipping
                              ? 'border-destructive'
                              : ''
                          }
                        >
                          <SelectValue placeholder="Select shipping" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingOptions.map((option) => (
                            <SelectItem key={option._id} value={option._id}>
                              {option.name} - ৳{option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {formErrors.selectedShipping && (
                      <p className="text-xs text-destructive">
                        Shipping Option is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
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

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={paymentStatus}
                      onValueChange={setPaymentStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label>Special Discount (৳)</Label>
                    <Input
                      type="number"
                      value={specialDiscount}
                      onChange={(e) =>
                        setSpecialDiscount(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>৳{calculatedTotals.subtotal.toFixed(2)}</span>
                  </div>
                  {vatPercentage > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">
                        VAT ({vatPercentage}%):
                      </span>
                      <span>৳{calculatedTotals.vat.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery Charge:</span>
                    <span>
                      {hasFreeShippingProduct ? (
                        <span className="text-green-600 font-semibold">
                          Free
                        </span>
                      ) : (
                        `৳${calculatedTotals.deliveryCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Discount:</span>
                    <span>-৳{specialDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-base">
                    <span>Total:</span>
                    <span className="text-primary">
                      ৳{calculatedTotals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={isLoading || orderItems.length === 0 || hasFormErrors}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNewOrderCreate;
