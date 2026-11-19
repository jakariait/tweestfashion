import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
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
  DialogDescription,
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
import {
  Plus,
  Trash2,
  Search,
  Loader2,
  Package,
  X,
  User,
  ShoppingCart,
  Truck,
  StickyNote,
  Layers,
  RefreshCw,
  CreditCard,
  MapPin,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import ComboProductSelector from '../componentGeneral/ComboProductSelector.jsx';
import { getVariantDisplayName } from '@/utils/variantDisplay.js';
import { cn } from '@/lib/utils';
import useOrderStore from '../../store/useOrderStore.js';
import { Separator } from '@/components/ui/separator';

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

const getProductImage = (product) =>
  product?.thumbnailImage || product?.images?.[0] || '';

const SectionHeader = ({ icon: Icon, title, description, action = null }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action}
    <div className="h-4 w-px bg-border hidden sm:block" />
  </div>
);

const Field = ({ children, label, error, errorMessage }) => (
  <div className="space-y-1.5 sm:space-y-2">
    {label && (
      <Label className="text-sm font-medium text-foreground">{label}</Label>
    )}
    {children}
    {error && errorMessage && (
      <p className="text-[10px] text-destructive flex items-center gap-1">
        <AlertCircle className="size-3" />
        {errorMessage}
      </p>
    )}
  </div>
);

const AdminNewOrderCreate = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { fetchAllOrders } = useOrderStore();

  const comboSelectorRef = useRef(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

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

  const [comboProduct, setComboProduct] = useState(null);
  const [comboVariant, setComboVariant] = useState(null);
  const [comboQuantity, setComboQuantity] = useState(1);
  const [comboState, setComboState] = useState({
    availableStock: null,
    stockOut: false,
    isComplete: false,
    selectedCount: 0,
    requiredCount: 0,
  });

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
    specialDiscount: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllProductsAdmin`, {
        params: { limit: 1000 },
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
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.productCode?.toLowerCase().includes(term),
    );
  }, [products, productSearch]);

  const productImageMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(String(p._id), getProductImage(p)));
    return map;
  }, [products]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase()),
    );
  }, [customers, customerSearch]);

  const resetSelectedProduct = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
  };

  const handleProductSelect = (product) => {
    if (product.isCombo && product.comboProducts?.length > 0) {
      setSelectedProduct(null);
      setSelectedVariant(null);
      setComboProduct(product);
      setComboVariant(null);
      setComboQuantity(1);
      setComboState({
        availableStock: null,
        stockOut: false,
        isComplete: false,
        selectedCount: 0,
        requiredCount: 0,
      });
      setComboDialogOpen(true);
      return;
    }

    if (product.variants?.length > 0) {
      setSelectedProduct(product);
      setSelectedVariant(null);
      setQuantity(1);
      setVariantDialogOpen(true);
      return;
    }

    setSelectedProduct(product);
    setSelectedVariant(null);
  };

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

    if (Number(quantity) < 1) {
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
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      price,
      freeShipping: selectedProduct.freeShipping || false,
    };

    setOrderItems((prev) => [...prev, newItem]);
    resetSelectedProduct();
    setProductSearch('');
    toast.success('Product added to order');
    setVariantDialogOpen(false);
  };

  const closeComboDialog = () => {
    setComboDialogOpen(false);
    setComboProduct(null);
    setComboVariant(null);
    setComboQuantity(1);
    setComboState({
      availableStock: null,
      stockOut: false,
      isComplete: false,
      selectedCount: 0,
      requiredCount: 0,
    });
  };

  const handleAddComboProduct = () => {
    if (!comboProduct) return;

    if (comboProduct.variants?.length > 0 && !comboVariant) {
      toast.error('Select a combo pack option first');
      return;
    }

    if (!comboSelectorRef.current?.validate()) return;

    const comboSelections = comboSelectorRef.current?.getPayload() || [];
    if (comboSelections.length === 0) {
      toast.error('Select the products for this combo');
      return;
    }

    const price = comboVariant
      ? comboVariant.discount || comboVariant.price || 0
      : comboProduct.finalDiscount > 0
        ? comboProduct.finalDiscount
        : comboProduct.finalPrice || 0;

    const comboKey = comboSelections
      .map(
        (selection) =>
          `${selection.productId}:${selection.variantId || 'Default'}:${selection.quantity || 1}`,
      )
      .sort()
      .join('|');

    const newItem = {
      productId: comboProduct._id,
      productName: comboProduct.name,
      variantId: comboVariant?._id || null,
      variantName: comboVariant ? getVariantDisplayName(comboVariant) : 'Combo',
      quantity: Math.max(1, parseInt(comboQuantity, 10) || 1),
      price,
      freeShipping: comboProduct.freeShipping || false,
      comboKey,
      comboSelections,
    };

    setOrderItems((prev) => [...prev, newItem]);
    closeComboDialog();
    setProductSearch('');
    toast.success('Combo product added to order');
  };

  const handleRemoveItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index, value) => {
    const next = Math.max(1, parseInt(value, 10) || 1);
    setOrderItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: next } : item)),
    );
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
    setComboProduct(null);
    setComboVariant(null);
    setComboQuantity(1);
    setSpecialDiscount(0);
    setPromoCode('');
    setAdminNote('');
    setPaymentMethod('cash_on_delivery');
    setPaymentStatus('unpaid');
    setProductSearch('');
    setCustomerSearch('');
    setComboDialogOpen(false);
    setFormErrors({
      fullName: false,
      mobileNo: false,
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
      specialDiscount: false,
    });
  };

  const validateForm = useCallback(() => {
    const errors = {
      fullName: false,
      mobileNo: false,
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
      specialDiscount: false,
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

    if (parseFloat(specialDiscount || 0) > calculatedTotals.subtotal)
      errors.specialDiscount = true;

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
    specialDiscount,
    calculatedTotals.subtotal,
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
    <div className="w-full sm:w-auto">
      <Button
        type="button"
        onClick={handleOpenDialog}
        className="h-10 w-full gap-1.5 px-4 sm:w-auto rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
      >
        <Plus className="size-4" aria-hidden="true" />
        Create New Order
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-[900px] bg-background border border-border">
          <DialogHeader className="pb-4 pr-8">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Plus className="size-4" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  Create New Order
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Select a customer, add products (including combo packs), set
                  shipping &amp; payment, then place the order.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Customer */}
            <Card className="shadow-sm border border-border">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <SectionHeader
                  icon={User}
                  title="Customer Information"
                  description="Enter guest details or select a registered customer."
                />
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Customer Type</Label>
                    <Select
                      value={isGuest ? 'guest' : 'registered'}
                      onValueChange={(value) => setIsGuest(value === 'guest')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">
                          <div className="flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            Guest Checkout
                          </div>
                        </SelectItem>
                        <SelectItem value="registered">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            Registered User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isGuest ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Field
                        label="Full Name"
                        error={formErrors.fullName}
                        errorMessage="Full Name is required"
                      >
                        <Input
                          value={guestInfo.fullName}
                          onChange={(e) =>
                            setGuestInfo({
                              ...guestInfo,
                              fullName: e.target.value,
                            })
                          }
                          className={cn(
                            'w-full',
                            formErrors.fullName ? 'border-destructive' : '',
                          )}
                        />
                      </Field>
                      <Field
                        label="Mobile Number"
                        error={formErrors.mobileNo}
                        errorMessage="Mobile Number is required"
                      >
                        <Input
                          value={guestInfo.mobileNo}
                          onChange={(e) =>
                            setGuestInfo({
                              ...guestInfo,
                              mobileNo: e.target.value,
                            })
                          }
                          className={cn(
                            'w-full',
                            formErrors.mobileNo ? 'border-destructive' : '',
                          )}
                        />
                      </Field>
                      <Field label="Email">
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
                      </Field>
                      <Field
                        label="Address"
                        error={formErrors.address}
                        errorMessage="Address is required"
                      >
                        <Input
                          value={guestInfo.address}
                          onChange={(e) =>
                            setGuestInfo({
                              ...guestInfo,
                              address: e.target.value,
                            })
                          }
                          className={cn(
                            'w-full',
                            formErrors.address ? 'border-destructive' : '',
                          )}
                        />
                      </Field>
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
                        <div className="max-h-48 overflow-y-auto border border-border rounded-xl">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((cust) => (
                              <button
                                type="button"
                                key={cust._id}
                                className={`w-full text-left px-3 py-2.5 text-sm transition-colors rounded-lg ${
                                  selectedCustomer?._id === cust._id
                                    ? 'bg-primary/5 font-medium text-primary border-l-2 border-primary'
                                    : 'hover:bg-muted/50 border-transparent'
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
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                    {cust.fullName?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate text-foreground">
                                      {cust.fullName}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                      {cust.email}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center">
                              <AlertCircle className="size-4 mx-auto mb-1.5 text-muted-foreground opacity-50" />
                              <p className="text-[10px] text-muted-foreground">
                                No customers found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedCustomer && (
                        <Card className="bg-muted/40 border border-border/50">
                          <CardContent className="p-4 sm:p-5 space-y-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4 text-primary" />
                              <p className="font-medium text-sm text-foreground">
                                Customer Details (Editable)
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <Field
                                label="Full Name"
                                error={formErrors.fullName}
                                errorMessage="Full Name is required"
                              >
                                <Input
                                  value={guestInfo.fullName}
                                  onChange={(e) =>
                                    setGuestInfo({
                                      ...guestInfo,
                                      fullName: e.target.value,
                                    })
                                  }
                                  className={cn(
                                    'w-full',
                                    formErrors.fullName
                                      ? 'border-destructive'
                                      : '',
                                  )}
                                />
                              </Field>
                              <Field
                                label="Mobile Number"
                                error={formErrors.mobileNo}
                                errorMessage="Mobile Number is required"
                              >
                                <Input
                                  value={guestInfo.mobileNo}
                                  onChange={(e) =>
                                    setGuestInfo({
                                      ...guestInfo,
                                      mobileNo: e.target.value,
                                    })
                                  }
                                  className={cn(
                                    'w-full',
                                    formErrors.mobileNo
                                      ? 'border-destructive'
                                      : '',
                                  )}
                                />
                              </Field>
                              <Field label="Email">
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
                              </Field>
                              <Field
                                label="Address"
                                error={formErrors.address}
                                errorMessage="Address is required"
                              >
                                <Input
                                  value={guestInfo.address}
                                  onChange={(e) =>
                                    setGuestInfo({
                                      ...guestInfo,
                                      address: e.target.value,
                                    })
                                  }
                                  className={cn(
                                    'w-full',
                                    formErrors.address
                                      ? 'border-destructive'
                                      : '',
                                  )}
                                />
                              </Field>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <SectionHeader
                  icon={ShoppingCart}
                  title="Add Products"
                  description="Search and select products. Combo packs open a builder dialog."
                />

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

                <div className="max-h-[420px] overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {filteredProducts.map((p) => {
                        const hasVariants = p.variants?.length > 0;
                        const origPrice = hasVariants
                          ? p.variants[0]?.price
                          : p.finalPrice;
                        const discPrice = hasVariants
                          ? p.variants[0]?.discount
                          : p.finalDiscount;
                        const pct = calculateDiscountPercentage(
                          origPrice,
                          discPrice,
                        );
                        const stock = hasVariants
                          ? p.variants.reduce(
                              (sum, v) => sum + Number(v.stock || 0),
                              0,
                            )
                          : Number(p.finalStock || 0);
                        const isOutOfStock = stock <= 0;

                        return (
                          <button
                            type="button"
                            key={p._id}
                            disabled={isOutOfStock}
                            onClick={() => handleProductSelect(p)}
                            className={`relative block w-full text-left transition-all rounded-xl overflow-hidden border border-transparent ${
                              selectedProduct?._id === p._id
                                ? 'ring-2 ring-primary shadow-sm bg-primary/5'
                                : 'hover:border-border/50 hover:shadow-sm'
                            } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
                              <ImageComponent
                                imageName={p.thumbnailImage || p.images?.[0]}
                                className="h-full w-full object-cover"
                                altName={p.name}
                                skeletonHeight={170}
                              />
                              {isOutOfStock && (
                                <span className="absolute top-2 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-xs text-white font-medium">
                                  Out of stock
                                </span>
                              )}
                              {p.isCombo && (
                                <span className="absolute top-2 right-2 z-10 bg-blue-500 px-2 py-0.5 rounded text-xs text-white font-semibold">
                                  Combo
                                </span>
                              )}
                              {pct > 0 && !isOutOfStock && (
                                <span className="absolute top-2 left-0 bg-red-400 px-2 py-1 rounded text-white text-xs font-semibold">
                                  -{pct}%
                                </span>
                              )}
                              {hasVariants && (
                                <span className="absolute bottom-2 right-2 z-10 bg-black/40 px-2 py-0.5 rounded text-xs text-white">
                                  {p.variants.length} variant
                                  {p.variants.length === 1 ? '' : 's'}
                                </span>
                              )}
                            </div>
                            <div className="p-1.5 text-center">
                              <div className="text-sm font-medium truncate line-clamp-1">
                                {p.name}
                              </div>
                              <div className="flex gap-1.5 justify-center mt-0.5">
                                <span className="text-xs font-semibold">
                                  Tk.{' '}
                                  {formatPrice(
                                    discPrice > 0 ? discPrice : origPrice,
                                  )}
                                </span>
                                {discPrice > 0 && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    Tk. {formatPrice(origPrice)}
                                  </span>
                                )}
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
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                      <Package className="size-8 mb-2 opacity-40" />
                      <p>No products found</p>
                    </div>
                  )}
                </div>

                {selectedProduct && !selectedProduct.variants?.length && (
                  <div className="flex flex-col sm:flex-row items-end gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {selectedProduct.thumbnailImage ||
                      selectedProduct.images?.[0] ? (
                        <ImageComponent
                          imageName={
                            selectedProduct.thumbnailImage ||
                            selectedProduct.images?.[0]
                          }
                          className="h-full w-full object-cover"
                          altName={selectedProduct.name}
                          skeletonHeight={64}
                        />
                      ) : (
                        <Package className="size-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-sm font-medium truncate">
                        {selectedProduct.name}
                      </div>
                      {selectedProduct.productCode && (
                        <div className="text-xs text-muted-foreground truncate">
                          {selectedProduct.productCode}
                        </div>
                      )}
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min={1}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-sm font-semibold text-right whitespace-nowrap">
                        ৳
                        {formatPrice(
                          (selectedProduct.finalDiscount > 0
                            ? selectedProduct.finalDiscount
                            : selectedProduct.finalPrice || 0) *
                            Math.max(1, parseInt(quantity, 10) || 1),
                        )}
                      </span>
                      <Button onClick={handleAddProduct}>
                        <Plus className="size-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetSelectedProduct}
                        className="h-9 px-2"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {orderItems.length > 0 && (
                  <>
                    <div className="flex items-center justify-between pt-2">
                      <h3 className="font-semibold">Order Items</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOrderItems([])}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        <RefreshCw className="size-3.5 mr-1" /> Clear all
                      </Button>
                    </div>
                    <div className="rounded-xl bg-muted/40 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16"></TableHead>
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
                          {orderItems.map((item, index) => {
                            const itemImage =
                              productImageMap.get(String(item.productId)) || '';
                            const isComboItem = !!item.comboKey;
                            return (
                              <TableRow key={index}>
                                <TableCell className="w-16">
                                  {itemImage ? (
                                    <ImageComponent
                                      imageName={itemImage}
                                      className="h-12 w-12 object-cover rounded"
                                      altName={item.productName}
                                      skeletonHeight={48}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                                      <Package className="size-4 text-gray-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {item.productName}
                                  {isComboItem && (
                                    <Badge
                                      variant="outline"
                                      className="ml-1 text-[9px]"
                                    >
                                      Combo
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>{item.variantName}</TableCell>
                                <TableCell className="text-right">
                                  ৳{item.price}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItemQuantity(index, e.target.value)
                                    }
                                    min={1}
                                    className="w-16 text-right text-xs bg-transparent border-none focus:ring-0"
                                  />
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
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <SectionHeader
                  icon={Truck}
                  title="Shipping & Payment"
                  description="Choose a shipping option and payment method."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Field
                    label="Shipping Option"
                    error={formErrors.selectedShipping}
                    errorMessage="Shipping Option is required"
                  >
                    {hasFreeShippingProduct ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium">
                        <Truck className="size-4" />
                        Free Shipping
                      </div>
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
                              {option.name} - Tk.{option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  <Field label="Payment Method">
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_on_delivery">
                          <div className="flex items-center gap-2">
                            <CreditCard className="size-4 text-muted-foreground" />
                            Cash on Delivery
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Payment Status">
                    <Select
                      value={paymentStatus}
                      onValueChange={setPaymentStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            Unpaid
                          </div>
                        </SelectItem>
                        <SelectItem value="paid">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-muted-foreground" />
                            Paid
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Special Discount">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                        ৳
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={specialDiscount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSpecialDiscount(
                            Math.min(val, calculatedTotals.subtotal),
                          );
                        }}
                        min={0}
                        max={calculatedTotals.subtotal}
                        className={cn(
                          'pl-8',
                          formErrors.specialDiscount
                            ? 'border-destructive'
                            : '',
                        )}
                      />
                    </div>
                    {formErrors.specialDiscount && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        Discount cannot exceed subtotal
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Flat amount deducted from subtotal
                    </p>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <SectionHeader
                icon={StickyNote}
                title="Admin Notes"
                description="Optional internal notes for this order."
                action={null}
              />
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="min-h-[80px]"
              />
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <SectionHeader
                  icon={Layers}
                  title="Order Summary"
                  description="Subtotal, VAT, delivery charge, discount and total."
                  action={null}
                />
                <Separator className="my-3" />
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
                  {specialDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">Discount:</span>
                      <span className="text-destructive">
                        -৳{specialDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">
                      ৳{calculatedTotals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="px-6 sm:p-8 gap-3 border-t border-border bg-muted/50 justify-end">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={isLoading || orderItems.length === 0 || hasFormErrors}
              className="h-10 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Create Order{' '}
              <span className="text-xs font-normal opacity-90">
                (Tk.{calculatedTotals.total.toFixed(2)})
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={comboDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeComboDialog();
        }}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden p-4 sm:max-w-2xl sm:p-6">
          <DialogHeader className="shrink-0 space-y-1.5 pr-8 text-left">
            <DialogTitle className="text-lg leading-snug">
              Build Combo: {comboProduct?.name}
            </DialogTitle>
            <DialogDescription>
              {comboProduct?.variants?.length > 0
                ? 'Select a combo pack option, then choose the included products.'
                : 'Choose the products included in this combo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {comboProduct?.variants?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Combo pack option
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {comboProduct.variants.map((variant) => {
                    const isSelected =
                      String(comboVariant?._id) === String(variant._id);
                    const outOfStock = Number(variant.stock || 0) < 1;

                    return (
                      <button
                        key={variant._id}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => setComboVariant(variant)}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                          isSelected
                            ? 'border-primary bg-primary/5 font-semibold text-primary'
                            : 'border-border bg-background hover:border-primary/50',
                        )}
                      >
                        <span>{getVariantDisplayName(variant)}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {outOfStock
                            ? 'Out of stock'
                            : `Tk. ${Number(variant.discount || variant.price || 0).toLocaleString()}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <ComboProductSelector
              ref={comboSelectorRef}
              product={comboProduct}
              selectedVariant={comboVariant}
              onChange={setComboState}
            />
          </div>

          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeComboDialog}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddComboProduct}
              disabled={
                (comboProduct?.variants?.length > 0 && !comboVariant) ||
                comboState.stockOut ||
                !comboState.isComplete
              }
              className="h-11 sm:h-9"
            >
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={variantDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setVariantDialogOpen(false);
            setSelectedProduct(null);
            setSelectedVariant(null);
            setQuantity(1);
          }
        }}
      >
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg leading-snug">
              Select Variant: {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Choose a variant and quantity to add to the order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {selectedProduct?.variants?.map((variant) => {
                const isSelected =
                  String(selectedVariant?._id) === String(variant._id);
                const outOfStock = Number(variant.stock || 0) < 1;
                const price =
                  variant.discount > 0 ? variant.discount : variant.price || 0;

                return (
                  <button
                    key={variant._id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      'flex flex-col items-start justify-between gap-2 rounded-lg border px-3 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      isSelected
                        ? 'border-primary bg-primary/5 font-semibold text-primary'
                        : 'border-border bg-background hover:border-primary/50',
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {getVariantName(variant)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getVariantDisplayName(variant)}
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="font-semibold">
                        Tk. {formatPrice(price)}
                      </span>
                      {variant.discount > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          Tk. {formatPrice(variant.price || 0)}
                        </span>
                      )}
                      {outOfStock && (
                        <span className="text-[10px] font-semibold text-red-500 uppercase">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
              />
            </div>

            <div className="flex items-end gap-2 pt-2">
              <span className="text-sm font-semibold text-right whitespace-nowrap">
                ৳
                {formatPrice(
                  (selectedVariant
                    ? selectedVariant.discount > 0
                      ? selectedVariant.discount
                      : selectedVariant.price || 0
                    : 0) * Math.max(1, parseInt(quantity, 10) || 1),
                )}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:flex-row-reverse">
            <Button
              variant="outline"
              onClick={() => {
                setVariantDialogOpen(false);
                setSelectedProduct(null);
                setSelectedVariant(null);
                setQuantity(1);
              }}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={
                !selectedVariant ||
                Number(quantity) < 1 ||
                (selectedVariant && Number(selectedVariant.stock || 0) < 1)
              }
              className="w-full sm:w-auto h-10"
            >
              <Plus className="size-4 mr-1" />
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNewOrderCreate;
