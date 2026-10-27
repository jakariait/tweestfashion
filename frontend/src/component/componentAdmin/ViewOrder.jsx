import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useGeneralInfoStore from '../../store/GeneralInfoStore';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import sanitizeHtml from '../../utils/sanitizeHtml.js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRef } from 'react';
import OrderStatusUpdate from './OrderStatusUpdate.jsx';
import CourierStats from './CourierStats.jsx';
import RequirePermission from './RequirePermission.jsx';
import { debounce } from 'lodash';
import { Printer, Pencil, X, Plus, Save } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

const ViewOrder = () => {
  const printRef = useRef(null);

  const { GeneralInfoList } = useGeneralInfoStore();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditMode, setIsEditMode] = useState(false);
  const [editableOrder, setEditableOrder] = useState(null);

  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getVariantDisplayName = (variant) => {
    if (!variant) return 'N/A';

    if (variant.attributes && Array.isArray(variant.attributes)) {
      const attributeValues = variant.attributes
        .map((attr) => attr.value)
        .filter((val) => val);
      if (attributeValues.length > 0) {
        return attributeValues.join(' / ');
      }
    }

    if (variant.size?.name) {
      return variant.size.name;
    }

    return 'N/A';
  };

  const handlePrint = () => {
    const content = document.getElementById('print-area');
    if (!content) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`
    <html><head><title>Print Invoice</title><style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1; margin: 20px; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    img { width: 100px; }
    #firstRow, #secondRow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    #thirdRow { display: flex; justify-content: space-between; margin-top: 20px; }
    button, .no-print { display: none !important; }
    #thirdRowRight, #secondRowRight { text-align: right; }
    </style></head><body>${sanitizeHtml(content.innerHTML)}</body></html>
  `);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  const getStatusColor = (status) =>
    ({
      pending: { color: 'text-amber-500', text: 'Pending' },
      intransit: { color: 'text-blue-500', text: 'In Transit' },
      approved: { color: 'text-teal-500', text: 'Approved' },
      delivered: { color: 'text-green-500', text: 'Delivered' },
      cancelled: { color: 'text-red-500', text: 'Cancelled' },
      returned: { color: 'text-purple-500', text: 'Returned' },
    })[status] || { color: 'text-muted-foreground', text: 'Unknown' };

  const getPaymentStatusColor = (status) =>
    ({
      unpaid: { color: 'text-amber-500', text: 'Unpaid' },
      paid: { color: 'text-green-500', text: 'Paid' },
    })[status] || { color: 'text-muted-foreground', text: 'Unknown' };

  const getPaymentMethodText = (method) =>
    ({
      cash_on_delivery: 'Cash on Delivery',
      bkash: 'bKash',
      nagad: 'Nagad',
      card: 'Card',
    })[method] || 'Unknown Method';

  const getDeliveryMethodText = (method) =>
    ({
      home_delivery: 'Home Delivery',
    })[method] || 'Unknown Method';

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not authenticated.');

      const res = await axios.get(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res.data.order);
      const editable = JSON.parse(JSON.stringify(res.data.order));
      if (!editable.billingInfo) {
        editable.billingInfo = { ...editable.shippingInfo };
      }
      setEditableOrder(editable);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleEditToggle = () => {
    if (isEditMode) {
      const editable = JSON.parse(JSON.stringify(order));
      if (!editable.billingInfo) {
        editable.billingInfo = { ...editable.shippingInfo };
      }
      setEditableOrder(editable);
    }
    setIsEditMode(!isEditMode);
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setEditableOrder((prev) => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, [name]: value },
    }));
  };

  const handleBillingInfoChange = (e) => {
    const { name, value } = e.target;
    setEditableOrder((prev) => ({
      ...prev,
      billingInfo: { ...prev.billingInfo, [name]: value },
    }));
  };

  const handleItemQuantityChange = (index, quantity) => {
    const newQuantity = Math.max(1, Number(quantity));
    const newItems = [...editableOrder.items];
    newItems[index].quantity = newQuantity;
    setEditableOrder((prev) => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index) => {
    const newItems = editableOrder.items.filter((_, i) => i !== index);
    setEditableOrder((prev) => ({ ...prev, items: newItems }));
  };

  const debouncedProductSearch = useMemo(
    () =>
      debounce(async (query) => {
        try {
          const res = await axios.get(
            `${apiUrl}/getAllProductsAdmin?search=${query}`,
          );
          setSearchedProducts(res.data.products || []);
        } catch (error) {
          console.error('Failed to search products:', error);
        }
      }, 500),
    [],
  );

  useEffect(() => {
    if (isAddProductModalOpen) {
      debouncedProductSearch(productSearchQuery);
    }
    return () => debouncedProductSearch.cancel();
  }, [productSearchQuery, debouncedProductSearch, isAddProductModalOpen]);

  const handleAddProduct = async (product, variant = null) => {
    const price = variant
      ? variant.discount || variant.price
      : product.finalDiscount > 0
        ? product.finalDiscount
        : product.finalPrice;

    const newItem = {
      productId: product._id,
      variantId: variant ? variant._id : undefined,
      quantity: 1,
      price: price,
      product: {
        _id: product._id,
        name: product.name,
        productCode: product.productCode || product.code,
        category: { name: product.category?.name },
        variants: variant ? [variant] : [],
      },
    };

    setEditableOrder((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setAddProductModalOpen(false);
    setProductSearchQuery('');
    setSearchedProducts([]);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const updatePayload = {
        shippingInfo: editableOrder.shippingInfo,
        billingInfo: editableOrder.billingInfo,
        items: editableOrder.items.map(
          ({ productId, variantId, quantity, price }) => ({
            productId:
              typeof productId === 'object' ? productId._id : productId,
            variantId:
              typeof variantId === 'object' && variantId !== null
                ? variantId._id
                : variantId,
            quantity,
            price,
          }),
        ),
      };

      await axios.put(`${apiUrl}/orders/${orderId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditMode(false);
      await fetchOrder();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to update order.',
      );
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-destructive">{error}</div>;

  const currentOrderData = isEditMode ? editableOrder : order;
  const orderStatusColor = getStatusColor(currentOrderData.orderStatus);
  const paymentStatusColor = getPaymentStatusColor(
    currentOrderData.paymentStatus,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
        <div className="flex gap-2 no-print">
          <RequirePermission permission="edit_orders">
            <Button variant="outline" onClick={handleEditToggle}>
              <Pencil className="size-4 mr-1" />
              {isEditMode ? 'Cancel' : 'Edit Order'}
            </Button>
          </RequirePermission>
          <Button variant="ghost" onClick={handlePrint}>
            <Printer className="size-4 mr-1" />
            Print Invoice
          </Button>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="p-6" id="print-area" ref={printRef}>
          <div id="firstRow" className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {GeneralInfoList?.CompanyName ?? ''}
            </h1>
            <ImageComponent
              imageName={GeneralInfoList?.PrimaryLogo}
              className="w-30"
            />
            <div className="text-2xl font-bold">Invoice</div>
          </div>

          <div id="secondRow" className="flex justify-between mb-6 gap-8">
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-2">Shipping Info:</h2>
              {isEditMode ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Full Name"
                    name="fullName"
                    value={editableOrder?.shippingInfo?.fullName ?? ''}
                    onChange={handleShippingInfoChange}
                  />
                  <Input
                    placeholder="Mobile No"
                    name="mobileNo"
                    value={editableOrder?.shippingInfo?.mobileNo ?? ''}
                    onChange={handleShippingInfoChange}
                  />
                  <Input
                    placeholder="Email"
                    name="email"
                    value={editableOrder?.shippingInfo?.email ?? ''}
                    onChange={handleShippingInfoChange}
                  />
                  <textarea
                    placeholder="Address"
                    name="address"
                    value={editableOrder?.shippingInfo?.address ?? ''}
                    onChange={handleShippingInfoChange}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  />
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p>{currentOrderData.shippingInfo?.fullName}</p>
                  <p className="text-muted-foreground">
                    {currentOrderData.shippingInfo?.mobileNo}
                  </p>
                  <p className="text-muted-foreground">
                    {currentOrderData.shippingInfo?.email}
                  </p>
                  <p className="text-muted-foreground">
                    {currentOrderData.shippingInfo?.address}
                  </p>
                </div>
              )}
            </div>
            <div id="secondRowRight" className="text-right space-y-1">
              <p>
                <strong>Order No:</strong> {currentOrderData.orderNo}
              </p>
              <p>
                <strong>Order Date:</strong>{' '}
                {currentOrderData?.orderDate
                  ? new Date(currentOrderData.orderDate).toLocaleDateString()
                  : ''}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={orderStatusColor.color}>
                  {orderStatusColor.text}
                </span>
              </p>
              <p>
                <strong>Payment Method:</strong>{' '}
                {getPaymentMethodText(currentOrderData.paymentMethod)}
              </p>
              <p>
                <strong>Payment Status:</strong>{' '}
                <span className={paymentStatusColor.color}>
                  {paymentStatusColor.text}
                </span>
              </p>
              {currentOrderData.paymentId && (
                <p>
                  <strong>Payment ID:</strong>{' '}
                  <span className="text-sm">{currentOrderData.paymentId}</span>
                </p>
              )}
              {currentOrderData.transId && (
                <p>
                  <strong>Transaction ID:</strong> {currentOrderData.transId}
                </p>
              )}
              <p>
                <strong>Delivery Method:</strong>{' '}
                {getDeliveryMethodText(currentOrderData.deliveryMethod)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total</TableHead>
                  {isEditMode && (
                    <TableHead className="no-print">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrderData?.items?.map((item, index) => {
                  const product = item.product || item.productId;
                  const variant = product?.variants?.[0];
                  const totalPrice = item.price * item.quantity;

                  return (
                    <TableRow key={item._id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {product.images?.[0] ? (
                          <ImageComponent
                            imageName={product.images[0]}
                            className="size-12 rounded object-cover"
                            skeletonHeight={48}
                            altName={product.name}
                          />
                        ) : (
                          <div className="size-12 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Category: {product.category?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Code: {product.productCode || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variant ? getVariantDisplayName(variant) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemQuantityChange(index, e.target.value)
                            }
                            className="w-20 h-8"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell>{(item?.price ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{(totalPrice ?? 0).toFixed(2)}</TableCell>
                      {isEditMode && (
                        <TableCell className="no-print">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {isEditMode && (
              <div className="flex justify-start mt-4">
                <Button onClick={() => setAddProductModalOpen(true)}>
                  <Plus className="size-4 mr-1" />
                  Add Product
                </Button>
              </div>
            )}
          </div>

          <div id="thirdRow" className="mt-6 flex justify-between gap-8">
            <div>
              <h2 className="font-bold text-lg mb-2">Billing Address:</h2>
              {isEditMode ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Full Name"
                    name="fullName"
                    value={editableOrder.billingInfo?.fullName || ''}
                    onChange={handleBillingInfoChange}
                  />
                  <textarea
                    placeholder="Address"
                    name="address"
                    value={editableOrder.billingInfo?.address || ''}
                    onChange={handleBillingInfoChange}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  />
                </div>
              ) : (
                <>
                  <p>
                    {currentOrderData.billingInfo?.fullName ||
                      currentOrderData.shippingInfo?.fullName}
                  </p>
                  <p className="text-muted-foreground">
                    {currentOrderData.billingInfo?.address ||
                      currentOrderData.shippingInfo?.address}
                  </p>
                </>
              )}
            </div>
            <div id="thirdRowRight" className="text-right space-y-1">
              <p>
                Sub-total: Tk.
                {(currentOrderData?.subtotalAmount ?? 0).toFixed(2)}
              </p>
              {(currentOrderData?.promoDiscount ?? 0) > 0 && (
                <p>
                  Promo Discount: Tk.
                  {(currentOrderData?.promoDiscount ?? 0).toFixed(2)}
                </p>
              )}
              {(currentOrderData?.rewardPointsUsed ?? 0) > 0 && (
                <p>
                  Reward Points Used: {currentOrderData?.rewardPointsUsed ?? 0}
                </p>
              )}
              {(currentOrderData?.vat ?? 0) > 0 && (
                <p>VAT/TAX: {(currentOrderData?.vat ?? 0).toFixed(2)}</p>
              )}
              <p>
                Delivery Charge:{' '}
                {(currentOrderData?.deliveryCharge ?? 0).toFixed(2)}
              </p>
              {(currentOrderData?.specialDiscount ?? 0) > 0 && (
                <p>
                  Special Discount Amount:{' '}
                  {(currentOrderData?.specialDiscount ?? 0).toFixed(2)}
                </p>
              )}
              <p className="text-xl font-bold">
                Total Order Amount:{' '}
                {(currentOrderData?.totalAmount ?? 0).toFixed(2)}
              </p>
              {(currentOrderData?.advanceAmount ?? 0) > 0 && (
                <p className="text-destructive">
                  Advance: {(currentOrderData?.advanceAmount ?? 0).toFixed(2)}
                </p>
              )}
              <p className="text-xl font-bold">
                Total Due Amount:{' '}
                {(currentOrderData?.dueAmount ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {isEditMode && (
            <div className="flex justify-end gap-2 mt-6 no-print">
              <Button onClick={handleSave}>
                <Save className="size-4 mr-1" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleEditToggle}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RequirePermission permission="edit_orders">
        <OrderStatusUpdate orderId={order._id} onUpdate={fetchOrder} />
      </RequirePermission>

      <CourierStats phone={order?.shippingInfo?.mobileNo ?? ''} />

      <Dialog
        open={isAddProductModalOpen}
        onOpenChange={setAddProductModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Product to Order</DialogTitle>
            <DialogDescription>
              Search for a product by name or code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Search for a product by name or code..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
            />
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchedProducts.length > 0 ? (
                    searchedProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          {product.variants && product.variants.length > 0
                            ? 'Multiple Variants'
                            : `Stock: ${product.finalStock}`}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (
                                product.variants &&
                                product.variants.length > 0
                              ) {
                                setSelectedProduct(product);
                              } else {
                                handleAddProduct(product);
                              }
                            }}
                            disabled={
                              !product.variants?.length &&
                              product.finalStock < 1
                            }
                          >
                            {product.variants && product.variants.length > 0
                              ? 'Select Variant'
                              : 'Add'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        {productSearchQuery.length > 1
                          ? 'No products found.'
                          : 'Type to search.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddProductModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Select Variant for {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Choose a variant to add to this order.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProduct?.variants?.map((variant) => (
                <TableRow key={variant._id}>
                  <TableCell>{getVariantDisplayName(variant)}</TableCell>
                  <TableCell>{variant.stock}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAddProduct(selectedProduct, variant);
                        setSelectedProduct(null);
                      }}
                      disabled={variant.stock < 1}
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewOrder;
