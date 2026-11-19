// import { useEffect, useState, useMemo, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import useGeneralInfoStore from '../../store/GeneralInfoStore';
// import ImageComponent from '../componentGeneral/ImageComponent.jsx';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import sanitizeHtml from '../../utils/sanitizeHtml.js';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { useRef } from 'react';
// import OrderStatusUpdate from './OrderStatusUpdate.jsx';
// import CourierStats from './CourierStats.jsx';
// import RequirePermission from './RequirePermission.jsx';
// import { debounce } from 'lodash';
// import { Printer, Pencil, X, Plus, Save } from 'lucide-react';
//
// const apiUrl = import.meta.env.VITE_API_URL;
//
// const ViewOrder = () => {
//   const printRef = useRef(null);
//
//   const { GeneralInfoList } = useGeneralInfoStore();
//   const { orderId } = useParams();
//
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editableOrder, setEditableOrder] = useState(null);
//
//   const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
//   const [productSearchQuery, setProductSearchQuery] = useState('');
//   const [searchedProducts, setSearchedProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//
//   const getVariantDisplayName = (variant) => {
//     if (!variant) return 'N/A';
//
//     if (variant.attributes && Array.isArray(variant.attributes)) {
//       const attributeValues = variant.attributes
//         .map((attr) => attr.value)
//         .filter((val) => val);
//       if (attributeValues.length > 0) {
//         return attributeValues.join(' / ');
//       }
//     }
//
//     if (variant.size?.name) {
//       return variant.size.name;
//     }
//
//     return 'N/A';
//   };
//
//   const handlePrint = () => {
//     const content = document.getElementById('print-area');
//     if (!content) return;
//     const iframe = document.createElement('iframe');
//     iframe.style.position = 'fixed';
//     iframe.style.right = '0';
//     iframe.style.bottom = '0';
//     iframe.style.width = '0';
//     iframe.style.height = '0';
//     iframe.style.border = '0';
//     document.body.appendChild(iframe);
//     const doc = iframe.contentWindow?.document;
//     if (!doc) return;
//     doc.open();
//     doc.write(`
//     <html><head><title>Print Invoice</title><style>
//     body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1; margin: 20px; }
//     h1 { font-size: 24px; margin-bottom: 20px; }
//     table { width: 100%; border-collapse: collapse; }
//     th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
//     img { width: 100px; }
//     #firstRow, #secondRow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
//     #thirdRow { display: flex; justify-content: space-between; margin-top: 20px; }
//     button, .no-print { display: none !important; }
//     #thirdRowRight, #secondRowRight { text-align: right; }
//     </style></head><body>${sanitizeHtml(content.innerHTML)}</body></html>
//   `);
//     doc.close();
//     iframe.onload = () => {
//       iframe.contentWindow?.focus();
//       iframe.contentWindow?.print();
//       setTimeout(() => document.body.removeChild(iframe), 1000);
//     };
//   };
//
//   const getStatusColor = (status) =>
//     ({
//       pending: { color: 'text-amber-500', text: 'Pending' },
//       intransit: { color: 'text-blue-500', text: 'In Transit' },
//       approved: { color: 'text-teal-500', text: 'Approved' },
//       delivered: { color: 'text-green-500', text: 'Delivered' },
//       cancelled: { color: 'text-red-500', text: 'Cancelled' },
//       returned: { color: 'text-purple-500', text: 'Returned' },
//     })[status] || { color: 'text-muted-foreground', text: 'Unknown' };
//
//   const getPaymentStatusColor = (status) =>
//     ({
//       unpaid: { color: 'text-amber-500', text: 'Unpaid' },
//       paid: { color: 'text-green-500', text: 'Paid' },
//     })[status] || { color: 'text-muted-foreground', text: 'Unknown' };
//
//   const getPaymentMethodText = (method) =>
//     ({
//       cash_on_delivery: 'Cash on Delivery',
//       bkash: 'bKash',
//       nagad: 'Nagad',
//       card: 'Card',
//     })[method] || 'Unknown Method';
//
//   const getDeliveryMethodText = (method) =>
//     ({
//       home_delivery: 'Home Delivery',
//     })[method] || 'Unknown Method';
//
//   const fetchOrder = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('You are not authenticated.');
//
//       const res = await axios.get(`${apiUrl}/orders/${orderId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//
//       setOrder(res.data.order);
//       const editable = JSON.parse(JSON.stringify(res.data.order));
//       if (!editable.billingInfo) {
//         editable.billingInfo = { ...editable.shippingInfo };
//       }
//       setEditableOrder(editable);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch order details.');
//     } finally {
//       setLoading(false);
//     }
//   }, [orderId]);
//
//   useEffect(() => {
//     fetchOrder();
//   }, [fetchOrder]);
//
//   const handleEditToggle = () => {
//     if (isEditMode) {
//       const editable = JSON.parse(JSON.stringify(order));
//       if (!editable.billingInfo) {
//         editable.billingInfo = { ...editable.shippingInfo };
//       }
//       setEditableOrder(editable);
//     }
//     setIsEditMode(!isEditMode);
//   };
//
//   const handleShippingInfoChange = (e) => {
//     const { name, value } = e.target;
//     setEditableOrder((prev) => ({
//       ...prev,
//       shippingInfo: { ...prev.shippingInfo, [name]: value },
//     }));
//   };
//
//   const handleBillingInfoChange = (e) => {
//     const { name, value } = e.target;
//     setEditableOrder((prev) => ({
//       ...prev,
//       billingInfo: { ...prev.billingInfo, [name]: value },
//     }));
//   };
//
//   const handleItemQuantityChange = (index, quantity) => {
//     const newQuantity = Math.max(1, Number(quantity));
//     const newItems = [...editableOrder.items];
//     newItems[index].quantity = newQuantity;
//     setEditableOrder((prev) => ({ ...prev, items: newItems }));
//   };
//
//   const handleRemoveItem = (index) => {
//     const newItems = editableOrder.items.filter((_, i) => i !== index);
//     setEditableOrder((prev) => ({ ...prev, items: newItems }));
//   };
//
//   const debouncedProductSearch = useMemo(
//     () =>
//       debounce(async (query) => {
//         try {
//           const res = await axios.get(
//             `${apiUrl}/getAllProductsAdmin?search=${query}`,
//           );
//           setSearchedProducts(res.data.products || []);
//         } catch (error) {
//           console.error('Failed to search products:', error);
//         }
//       }, 500),
//     [],
//   );
//
//   useEffect(() => {
//     if (isAddProductModalOpen) {
//       debouncedProductSearch(productSearchQuery);
//     }
//     return () => debouncedProductSearch.cancel();
//   }, [productSearchQuery, debouncedProductSearch, isAddProductModalOpen]);
//
//   const handleAddProduct = async (product, variant = null) => {
//     const price = variant
//       ? variant.discount || variant.price
//       : product.finalDiscount > 0
//         ? product.finalDiscount
//         : product.finalPrice;
//
//     const newItem = {
//       productId: product._id,
//       variantId: variant ? variant._id : undefined,
//       quantity: 1,
//       price: price,
//       product: {
//         _id: product._id,
//         name: product.name,
//         productCode: product.productCode || product.code,
//         category: { name: product.category?.name },
//         variants: variant ? [variant] : [],
//       },
//     };
//
//     setEditableOrder((prev) => ({ ...prev, items: [...prev.items, newItem] }));
//     setAddProductModalOpen(false);
//     setProductSearchQuery('');
//     setSearchedProducts([]);
//   };
//
//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Authentication token not found.');
//
//       const updatePayload = {
//         shippingInfo: editableOrder.shippingInfo,
//         billingInfo: editableOrder.billingInfo,
//         items: editableOrder.items.map(
//           ({
//             productId,
//             variantId,
//             quantity,
//             price,
//             comboKey,
//             comboSelections,
//           }) => ({
//             productId:
//               typeof productId === 'object' ? productId._id : productId,
//             variantId:
//               typeof variantId === 'object' && variantId !== null
//                 ? variantId._id
//                 : variantId,
//             quantity,
//             price,
//             comboKey: comboKey || '',
//             comboSelections: comboSelections || [],
//           }),
//         ),
//       };
//
//       await axios.put(`${apiUrl}/orders/${orderId}`, updatePayload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//
//       setIsEditMode(false);
//       await fetchOrder();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || err.message || 'Failed to update order.',
//       );
//     }
//   };
//
//   if (loading) return <div className="p-4">Loading...</div>;
//   if (error) return <div className="p-4 text-destructive">{error}</div>;
//
//   const currentOrderData = isEditMode ? editableOrder : order;
//   const orderStatusColor = getStatusColor(currentOrderData.orderStatus);
//   const paymentStatusColor = getPaymentStatusColor(
//     currentOrderData.paymentStatus,
//   );
//
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
//         <div className="flex gap-2 no-print">
//           <RequirePermission permission="edit_orders">
//             <Button variant="outline" onClick={handleEditToggle}>
//               <Pencil className="size-4 mr-1" />
//               {isEditMode ? 'Cancel' : 'Edit Order'}
//             </Button>
//           </RequirePermission>
//           <Button variant="ghost" onClick={handlePrint}>
//             <Printer className="size-4 mr-1" />
//             Print Invoice
//           </Button>
//         </div>
//       </div>
//
//       <Card className="shadow-md border-0">
//         <CardContent className="p-6" id="print-area" ref={printRef}>
//           <div id="firstRow" className="flex items-center justify-between mb-6">
//             <h1 className="text-2xl font-bold">
//               {GeneralInfoList?.CompanyName ?? ''}
//             </h1>
//             <ImageComponent
//               imageName={GeneralInfoList?.PrimaryLogo}
//               className="w-30"
//             />
//             <div className="text-2xl font-bold">Invoice</div>
//           </div>
//
//           <div id="secondRow" className="flex justify-between mb-6 gap-8">
//             <div className="flex-1">
//               <h2 className="font-bold text-lg mb-2">Shipping Info:</h2>
//               {isEditMode ? (
//                 <div className="space-y-2">
//                   <Input
//                     placeholder="Full Name"
//                     name="fullName"
//                     value={editableOrder?.shippingInfo?.fullName ?? ''}
//                     onChange={handleShippingInfoChange}
//                   />
//                   <Input
//                     placeholder="Mobile No"
//                     name="mobileNo"
//                     value={editableOrder?.shippingInfo?.mobileNo ?? ''}
//                     onChange={handleShippingInfoChange}
//                   />
//                   <Input
//                     placeholder="Email"
//                     name="email"
//                     value={editableOrder?.shippingInfo?.email ?? ''}
//                     onChange={handleShippingInfoChange}
//                   />
//                   <textarea
//                     placeholder="Address"
//                     name="address"
//                     value={editableOrder?.shippingInfo?.address ?? ''}
//                     onChange={handleShippingInfoChange}
//                     rows={2}
//                     className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
//                   />
//                 </div>
//               ) : (
//                 <div className="space-y-0.5">
//                   <p>{currentOrderData.shippingInfo?.fullName}</p>
//                   <p className="text-muted-foreground">
//                     {currentOrderData.shippingInfo?.mobileNo}
//                   </p>
//                   <p className="text-muted-foreground">
//                     {currentOrderData.shippingInfo?.email}
//                   </p>
//                   <p className="text-muted-foreground">
//                     {currentOrderData.shippingInfo?.address}
//                   </p>
//                 </div>
//               )}
//             </div>
//             <div id="secondRowRight" className="text-right space-y-1">
//               <p>
//                 <strong>Order No:</strong> {currentOrderData.orderNo}
//               </p>
//               <p>
//                 <strong>Order Date:</strong>{' '}
//                 {currentOrderData?.orderDate
//                   ? new Date(currentOrderData.orderDate).toLocaleDateString()
//                   : ''}
//               </p>
//               <p>
//                 <strong>Status:</strong>{' '}
//                 <span className={orderStatusColor.color}>
//                   {orderStatusColor.text}
//                 </span>
//               </p>
//               <p>
//                 <strong>Payment Method:</strong>{' '}
//                 {getPaymentMethodText(currentOrderData.paymentMethod)}
//               </p>
//               <p>
//                 <strong>Payment Status:</strong>{' '}
//                 <span className={paymentStatusColor.color}>
//                   {paymentStatusColor.text}
//                 </span>
//               </p>
//               {currentOrderData.paymentId && (
//                 <p>
//                   <strong>Payment ID:</strong>{' '}
//                   <span className="text-sm">{currentOrderData.paymentId}</span>
//                 </p>
//               )}
//               {currentOrderData.transId && (
//                 <p>
//                   <strong>Transaction ID:</strong> {currentOrderData.transId}
//                 </p>
//               )}
//               <p>
//                 <strong>Delivery Method:</strong>{' '}
//                 {getDeliveryMethodText(currentOrderData.deliveryMethod)}
//               </p>
//             </div>
//           </div>
//
//           <div className="mt-6">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>SL</TableHead>
//                   <TableHead className="w-16">Image</TableHead>
//                   <TableHead>Item</TableHead>
//                   <TableHead>Variant</TableHead>
//                   <TableHead>Quantity</TableHead>
//                   <TableHead>Unit Cost</TableHead>
//                   <TableHead>Total</TableHead>
//                   {isEditMode && (
//                     <TableHead className="no-print">Actions</TableHead>
//                   )}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {currentOrderData?.items?.map((item, index) => {
//                   const product = item.product || item.productId;
//                   const variant = product?.variants?.[0];
//                   const totalPrice = item.price * item.quantity;
//
//                   return (
//                     <TableRow key={item._id || index}>
//                       <TableCell>{index + 1}</TableCell>
//                       <TableCell>
//                         {product.images?.[0] ? (
//                           <ImageComponent
//                             imageName={product.images[0]}
//                             className="size-12 rounded object-cover"
//                             skeletonHeight={48}
//                             altName={product.name}
//                           />
//                         ) : (
//                           <div className="size-12 rounded bg-muted" />
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <div className="font-medium">{product.name}</div>
//                         <div className="text-sm text-muted-foreground">
//                           Category: {product.category?.name}
//                         </div>
//                         <div className="text-sm text-muted-foreground">
//                           Code: {product.productCode || 'N/A'}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         {variant ? getVariantDisplayName(variant) : 'N/A'}
//                         {item.comboSelections?.length > 0 && (
//                           <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
//                             {item.comboSelections.map((selection, sIndex) => (
//                               <li
//                                 key={`${selection.productId || selection.variantId}-${sIndex}`}
//                               >
//                                 {selection.name || 'Item'}
//                                 {selection.variant &&
//                                 selection.variant !== 'Default'
//                                   ? ` (${selection.variant})`
//                                   : ''}
//                                 {Number(selection.quantity) > 1
//                                   ? ` × ${selection.quantity}`
//                                   : ''}
//                               </li>
//                             ))}
//                           </ul>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {isEditMode ? (
//                           <Input
//                             type="number"
//                             value={item.quantity}
//                             onChange={(e) =>
//                               handleItemQuantityChange(index, e.target.value)
//                             }
//                             className="w-20 h-8"
//                           />
//                         ) : (
//                           item.quantity
//                         )}
//                       </TableCell>
//                       <TableCell>{(item?.price ?? 0).toFixed(2)}</TableCell>
//                       <TableCell>{(totalPrice ?? 0).toFixed(2)}</TableCell>
//                       {isEditMode && (
//                         <TableCell className="no-print">
//                           <Button
//                             variant="ghost"
//                             size="icon-xs"
//                             onClick={() => handleRemoveItem(index)}
//                             className="text-destructive hover:text-destructive"
//                           >
//                             <X className="size-3.5" />
//                           </Button>
//                         </TableCell>
//                       )}
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//             {isEditMode && (
//               <div className="flex justify-start mt-4">
//                 <Button onClick={() => setAddProductModalOpen(true)}>
//                   <Plus className="size-4 mr-1" />
//                   Add Product
//                 </Button>
//               </div>
//             )}
//           </div>
//
//           <div id="thirdRow" className="mt-6 flex justify-between gap-8">
//             <div>
//               <h2 className="font-bold text-lg mb-2">Billing Address:</h2>
//               {isEditMode ? (
//                 <div className="space-y-2">
//                   <Input
//                     placeholder="Full Name"
//                     name="fullName"
//                     value={editableOrder.billingInfo?.fullName || ''}
//                     onChange={handleBillingInfoChange}
//                   />
//                   <textarea
//                     placeholder="Address"
//                     name="address"
//                     value={editableOrder.billingInfo?.address || ''}
//                     onChange={handleBillingInfoChange}
//                     rows={2}
//                     className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <p>
//                     {currentOrderData.billingInfo?.fullName ||
//                       currentOrderData.shippingInfo?.fullName}
//                   </p>
//                   <p className="text-muted-foreground">
//                     {currentOrderData.billingInfo?.address ||
//                       currentOrderData.shippingInfo?.address}
//                   </p>
//                 </>
//               )}
//             </div>
//             <div id="thirdRowRight" className="text-right space-y-1">
//               <p>
//                 Sub-total: Tk.
//                 {(currentOrderData?.subtotalAmount ?? 0).toFixed(2)}
//               </p>
//               {(currentOrderData?.promoDiscount ?? 0) > 0 && (
//                 <p>
//                   Promo Discount: Tk.
//                   {(currentOrderData?.promoDiscount ?? 0).toFixed(2)}
//                 </p>
//               )}
//               {(currentOrderData?.rewardPointsUsed ?? 0) > 0 && (
//                 <p>
//                   Reward Points Used: {currentOrderData?.rewardPointsUsed ?? 0}
//                 </p>
//               )}
//               {(currentOrderData?.vat ?? 0) > 0 && (
//                 <p>VAT/TAX: {(currentOrderData?.vat ?? 0).toFixed(2)}</p>
//               )}
//               <p>
//                 Delivery Charge:{' '}
//                 {(currentOrderData?.deliveryCharge ?? 0).toFixed(2)}
//               </p>
//               {(currentOrderData?.specialDiscount ?? 0) > 0 && (
//                 <p>
//                   Special Discount Amount:{' '}
//                   {(currentOrderData?.specialDiscount ?? 0).toFixed(2)}
//                 </p>
//               )}
//               <p className="text-xl font-bold">
//                 Total Order Amount:{' '}
//                 {(currentOrderData?.totalAmount ?? 0).toFixed(2)}
//               </p>
//               {(currentOrderData?.advanceAmount ?? 0) > 0 && (
//                 <p className="text-destructive">
//                   Advance: {(currentOrderData?.advanceAmount ?? 0).toFixed(2)}
//                 </p>
//               )}
//               <p className="text-xl font-bold">
//                 Total Due Amount:{' '}
//                 {(currentOrderData?.dueAmount ?? 0).toFixed(2)}
//               </p>
//             </div>
//           </div>
//
//           {isEditMode && (
//             <div className="flex justify-end gap-2 mt-6 no-print">
//               <Button onClick={handleSave}>
//                 <Save className="size-4 mr-1" />
//                 Save Changes
//               </Button>
//               <Button variant="outline" onClick={handleEditToggle}>
//                 Cancel
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//
//       <RequirePermission permission="edit_orders">
//         <OrderStatusUpdate orderId={order._id} onUpdate={fetchOrder} />
//       </RequirePermission>
//
//       <CourierStats phone={order?.shippingInfo?.mobileNo ?? ''} />
//
//       <Dialog
//         open={isAddProductModalOpen}
//         onOpenChange={setAddProductModalOpen}
//       >
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Add Product to Order</DialogTitle>
//             <DialogDescription>
//               Search for a product by name or code.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             <Input
//               autoFocus
//               placeholder="Search for a product by name or code..."
//               value={productSearchQuery}
//               onChange={(e) => setProductSearchQuery(e.target.value)}
//             />
//             <div className="max-h-[400px] overflow-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Product</TableHead>
//                     <TableHead>Stock</TableHead>
//                     <TableHead className="w-24">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {searchedProducts.length > 0 ? (
//                     searchedProducts.map((product) => (
//                       <TableRow key={product._id}>
//                         <TableCell className="font-medium">
//                           {product.name}
//                         </TableCell>
//                         <TableCell>
//                           {product.variants && product.variants.length > 0
//                             ? 'Multiple Variants'
//                             : `Stock: ${product.finalStock}`}
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             size="sm"
//                             onClick={() => {
//                               if (
//                                 product.variants &&
//                                 product.variants.length > 0
//                               ) {
//                                 setSelectedProduct(product);
//                               } else {
//                                 handleAddProduct(product);
//                               }
//                             }}
//                             disabled={
//                               !product.variants?.length &&
//                               product.finalStock < 1
//                             }
//                           >
//                             {product.variants && product.variants.length > 0
//                               ? 'Select Variant'
//                               : 'Add'}
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell
//                         colSpan={3}
//                         className="text-center text-muted-foreground"
//                       >
//                         {productSearchQuery.length > 1
//                           ? 'No products found.'
//                           : 'Type to search.'}
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setAddProductModalOpen(false)}
//             >
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//
//       <Dialog
//         open={!!selectedProduct}
//         onOpenChange={() => setSelectedProduct(null)}
//       >
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               Select Variant for {selectedProduct?.name}
//             </DialogTitle>
//             <DialogDescription>
//               Choose a variant to add to this order.
//             </DialogDescription>
//           </DialogHeader>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Variant</TableHead>
//                 <TableHead>Stock</TableHead>
//                 <TableHead className="w-20">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {selectedProduct?.variants?.map((variant) => (
//                 <TableRow key={variant._id}>
//                   <TableCell>{getVariantDisplayName(variant)}</TableCell>
//                   <TableCell>{variant.stock}</TableCell>
//                   <TableCell>
//                     <Button
//                       size="sm"
//                       onClick={() => {
//                         handleAddProduct(selectedProduct, variant);
//                         setSelectedProduct(null);
//                       }}
//                       disabled={variant.stock < 1}
//                     >
//                       Add
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setSelectedProduct(null)}>
//               Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };
//
// export default ViewOrder;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import useGeneralInfoStore from '../../store/GeneralInfoStore';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import OrderInvoice from './OrderInvoice.jsx';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import ComboProductSelector from '../componentGeneral/ComboProductSelector.jsx';
import { getVariantDisplayName } from '@/utils/variantDisplay.js';
import OrderStatusUpdate from './OrderStatusUpdate.jsx';
import CourierStats from './CourierStats.jsx';
import RequirePermission from './RequirePermission.jsx';
import { debounce } from 'lodash';
import { AlertCircle, Loader2, Pencil, Printer, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const apiUrl = import.meta.env.VITE_API_URL;

const STATUS_META = {
  pending: {
    label: 'Pending',
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  },
  intransit: {
    label: 'In Transit',
    className:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
  },
  approved: {
    label: 'Approved',
    className:
      'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
  },
  delivered: {
    label: 'Delivered',
    className:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
  },
  returned: {
    label: 'Returned',
    className:
      'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300',
  },
};

const getStatusMeta = (status) =>
  STATUS_META[status] ?? {
    label: 'Unknown',
    className: 'border-border bg-muted text-muted-foreground',
  };

const OrderLoadingSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-live="polite">
    <span className="sr-only">Loading order details</span>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2 sm:ml-auto sm:w-52">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  </div>
);

const OrderErrorState = ({ message, onRetry }) => (
  <Card className="mx-auto w-full max-w-lg border-destructive/20 shadow-sm">
    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Could not load this order</h2>
        <p role="alert" className="text-sm text-muted-foreground">
          {message}
        </p>
      </div>
      <Button type="button" onClick={onRetry} className="h-11">
        Try again
      </Button>
    </CardContent>
  </Card>
);

const ViewOrder = ({ headerActions = null }) => {
  const invoiceRef = useRef(null);
  const productSearchRequestId = useRef(0);
  const comboSelectorRef = useRef(null);

  const { GeneralInfoList } = useGeneralInfoStore();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditMode, setIsEditMode] = useState(false);
  const [editableOrder, setEditableOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [comboProduct, setComboProduct] = useState(null);
  const [comboVariant, setComboVariant] = useState(null);
  const [comboState, setComboState] = useState({
    availableStock: null,
    stockOut: false,
    isComplete: false,
    selectedCount: 0,
    requiredCount: 0,
  });

  const handlePrint = useCallback(() => {
    invoiceRef.current?.print();
  }, []);

  const fetchOrder = useCallback(
    async (signal, { showLoading = true } = {}) => {
      try {
        if (showLoading) setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) throw new Error('You are not authenticated.');

        const res = await axios.get(`${apiUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });

        if (signal?.aborted) return;

        setOrder(res.data.order);
        const editable = JSON.parse(JSON.stringify(res.data.order));
        if (!editable.billingInfo) {
          editable.billingInfo = { ...editable.shippingInfo };
        }
        setEditableOrder(editable);
      } catch (err) {
        if (err?.code === 'ERR_CANCELED' || signal?.aborted) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch order details.',
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchOrder(controller.signal);
    return () => controller.abort();
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
    const newQuantity = Math.max(1, Number(quantity) || 1);
    setEditableOrder((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: newQuantity } : item,
      ),
    }));
  };

  const handleRemoveItem = (index) => {
    setEditableOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const debouncedProductSearch = useMemo(
    () =>
      debounce(async (query) => {
        const requestId = ++productSearchRequestId.current;
        setProductSearchLoading(true);
        try {
          const res = await axios.get(
            `${apiUrl}/getAllProductsAdmin?search=${encodeURIComponent(query)}`,
          );
          if (requestId !== productSearchRequestId.current) return;
          setSearchedProducts(res.data.products || []);
        } catch (searchError) {
          if (requestId !== productSearchRequestId.current) return;
          console.error('Failed to search products:', searchError);
          setSearchedProducts([]);
        } finally {
          if (requestId === productSearchRequestId.current) {
            setProductSearchLoading(false);
          }
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

  const handleAddProduct = (product, variant = null) => {
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

  const handleProductSelect = (product) => {
    if (product.isCombo && product.comboProducts?.length > 0) {
      setAddProductModalOpen(false);
      setProductSearchQuery('');
      setSearchedProducts([]);
      setComboProduct(product);
      setComboVariant(null);
      setComboState({
        availableStock: null,
        stockOut: false,
        isComplete: false,
        selectedCount: 0,
        requiredCount: 0,
      });
      return;
    }

    if (product.variants?.length > 0) {
      setSelectedProduct(product);
    } else {
      handleAddProduct(product);
    }
  };

  const closeComboDialog = () => {
    setComboProduct(null);
    setComboVariant(null);
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
      toast.error('Select a combo pack option first.');
      return;
    }

    if (!comboSelectorRef.current?.validate()) return;

    const comboSelections = comboSelectorRef.current?.getPayload() || [];
    if (comboSelections.length === 0) {
      toast.error('Select the products for this combo.');
      return;
    }

    const price = comboVariant
      ? comboVariant.discount || comboVariant.price
      : comboProduct.finalDiscount > 0
        ? comboProduct.finalDiscount
        : comboProduct.finalPrice;

    const comboKey = comboSelections
      .map(
        (selection) =>
          `${selection.productId}:${selection.variantId || 'Default'}:${selection.quantity || 1}`,
      )
      .sort()
      .join('|');

    const newItem = {
      productId: comboProduct._id,
      variantId: comboVariant ? comboVariant._id : undefined,
      quantity: 1,
      price,
      comboKey,
      comboSelections,
      product: {
        _id: comboProduct._id,
        name: comboProduct.name,
        productCode: comboProduct.productCode || comboProduct.code,
        category: { name: comboProduct.category?.name },
        variants: comboVariant ? [comboVariant] : [],
      },
    };

    setEditableOrder((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    closeComboDialog();
    toast.success('Combo product added to the order.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const updatePayload = {
        shippingInfo: editableOrder.shippingInfo,
        billingInfo: editableOrder.billingInfo,
        items: editableOrder.items.map(
          ({
            productId,
            variantId,
            quantity,
            price,
            comboKey,
            comboSelections,
          }) => ({
            productId:
              typeof productId === 'object' ? productId._id : productId,
            variantId:
              typeof variantId === 'object' && variantId !== null
                ? variantId._id
                : variantId,
            quantity,
            price,
            comboKey: comboKey || '',
            comboSelections: (comboSelections || []).map((selection) => ({
              ...selection,
              productId:
                typeof selection.productId === 'object' &&
                selection.productId !== null
                  ? selection.productId._id
                  : selection.productId,
            })),
          }),
        ),
      };

      await axios.put(`${apiUrl}/orders/${orderId}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditMode(false);
      await fetchOrder(undefined, { showLoading: false });
      toast.success('Order updated successfully.');
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to update order.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <OrderLoadingSkeleton />;
  if (error) {
    return <OrderErrorState message={error} onRetry={() => fetchOrder()} />;
  }
  if (!order) return null;

  const currentOrderData = isEditMode ? editableOrder : order;
  if (!currentOrderData) return null;

  const orderStatus = getStatusMeta(currentOrderData.orderStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Order Details
            </h1>
            {currentOrderData.orderNo && (
              <Badge
                variant="outline"
                className="font-mono text-xs tabular-nums text-muted-foreground"
              >
                #{currentOrderData.orderNo}
              </Badge>
            )}
            <Badge className={cn('border', orderStatus.className)}>
              {orderStatus.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Review customer information, ordered items, and payment details.
          </p>
        </div>

        <div className="flex flex-col gap-2 no-print sm:items-end">
          {headerActions}
          <div className="flex items-center gap-2">
            <RequirePermission permission="edit_orders">
              <Button
                type="button"
                variant="outline"
                onClick={handleEditToggle}
                disabled={saving}
                className="h-11 flex-1 gap-2 px-4 sm:h-10 sm:flex-none"
              >
                {isEditMode ? (
                  <X className="size-4" aria-hidden="true" />
                ) : (
                  <Pencil className="size-4" aria-hidden="true" />
                )}
                {isEditMode ? 'Cancel' : 'Edit Order'}
              </Button>
            </RequirePermission>
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrint}
              className="h-11 flex-1 gap-2 px-3 sm:h-10 sm:flex-none"
            >
              <Printer className="size-4" aria-hidden="true" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      <OrderInvoice
        ref={invoiceRef}
        order={currentOrderData}
        isEditMode={isEditMode}
        saving={saving}
        generalInfo={GeneralInfoList}
        orderStatusMeta={orderStatus}
        onShippingInfoChange={handleShippingInfoChange}
        onBillingInfoChange={handleBillingInfoChange}
        onItemQuantityChange={handleItemQuantityChange}
        onRemoveItem={handleRemoveItem}
        onSave={handleSave}
        onCancel={handleEditToggle}
        onAddProduct={() => setAddProductModalOpen(true)}
      />

      <RequirePermission permission="edit_orders">
        <OrderStatusUpdate
          orderId={order._id}
          onUpdate={() => fetchOrder(undefined, { showLoading: false })}
        />
      </RequirePermission>

      <CourierStats phone={order?.shippingInfo?.mobileNo ?? ''} />

      <Dialog
        open={isAddProductModalOpen}
        onOpenChange={(open) => {
          setAddProductModalOpen(open);
          if (!open) {
            productSearchRequestId.current += 1;
            setProductSearchQuery('');
            setSearchedProducts([]);
            setProductSearchLoading(false);
          }
        }}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden p-4 sm:max-w-2xl sm:p-6">
          <DialogHeader className="shrink-0 space-y-1.5 pr-8 text-left">
            <DialogTitle className="text-lg leading-snug">
              Add Product to Order
            </DialogTitle>
            <DialogDescription>
              Search for a product by name or code.
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="relative shrink-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                autoFocus
                type="search"
                aria-label="Search products by name or code"
                placeholder="Search products by name or code…"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="h-11 pl-9 pr-10"
              />
              {productSearchLoading && (
                <Loader2
                  className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <span role="status" className="sr-only">
              {productSearchLoading ? 'Searching products' : ''}
            </span>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border/60">
              {productSearchLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Searching…
                </div>
              ) : searchedProducts.length > 0 ? (
                <>
                  <div className="divide-y divide-border/60 sm:hidden">
                    {searchedProducts.map((product) => {
                      const hasVariants = product.variants?.length > 0;
                      const isCombo =
                        product.isCombo && product.comboProducts?.length > 0;
                      const isUnavailable =
                        !hasVariants && product.finalStock < 1;

                      return (
                        <div key={product._id} className="space-y-3 p-3">
                          <div className="min-w-0 space-y-1">
                            <p className="break-words text-sm font-semibold text-foreground">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.productCode
                                ? `${product.productCode} · `
                                : ''}
                              {hasVariants
                                ? 'Multiple variants available'
                                : isCombo
                                  ? `Combo pack · Stock: ${product.finalStock}`
                                  : `Stock: ${product.finalStock}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleProductSelect(product)}
                            disabled={isUnavailable}
                            className="h-11 w-full"
                          >
                            {isCombo
                              ? 'Build Combo'
                              : hasVariants
                                ? 'Select Variant'
                                : 'Add'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden sm:block">
                    <Table aria-label="Product search results">
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Product</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="w-28 text-right">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchedProducts.map((product) => {
                          const hasVariants = product.variants?.length > 0;
                          const isCombo =
                            product.isCombo &&
                            product.comboProducts?.length > 0;
                          const isUnavailable =
                            !hasVariants && product.finalStock < 1;

                          return (
                            <TableRow key={product._id}>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {hasVariants
                                  ? 'Multiple Variants'
                                  : isCombo
                                    ? `Combo · Stock: ${product.finalStock}`
                                    : `Stock: ${product.finalStock}`}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleProductSelect(product)}
                                  disabled={isUnavailable}
                                  className="h-11 sm:h-8"
                                >
                                  {isCombo
                                    ? 'Build Combo'
                                    : hasVariants
                                      ? 'Select Variant'
                                      : 'Add'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="flex min-h-40 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                  {productSearchQuery.length > 1
                    ? 'No products found.'
                    : 'Type to search.'}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddProductModalOpen(false)}
              className="h-11 w-full sm:h-9 sm:w-auto"
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
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table aria-label="Product variants">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Variant</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="w-28 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProduct?.variants?.map((variant) => (
                  <TableRow key={variant._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted">
                          <ImageComponent
                            imageName={
                              variant.image || selectedProduct.thumbnailImage
                            }
                            className="h-full w-full object-cover"
                            skeletonHeight={56}
                            width={56}
                            height={56}
                            altName={selectedProduct?.name}
                          />
                        </div>
                        <span>{getVariantDisplayName(variant)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {variant.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          handleAddProduct(selectedProduct, variant);
                          setSelectedProduct(null);
                        }}
                        disabled={variant.stock < 1}
                        className="h-11 sm:h-8"
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedProduct(null)}
              className="h-11 sm:h-9"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!comboProduct}
        onOpenChange={(open) => {
          if (!open) closeComboDialog();
        }}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden p-4 sm:max-w-2xl sm:p-6">
          <DialogHeader className="shrink-0 space-y-1.5 pr-8 text-left">
            <DialogTitle className="text-lg leading-snug">
              Add Combo Product: {comboProduct?.name}
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
                comboState.stockOut
              }
              className="h-11 sm:h-9"
            >
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewOrder;
