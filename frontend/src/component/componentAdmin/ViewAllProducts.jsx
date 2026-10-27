import { useEffect, useState } from 'react';
import useProductStore from '../../store/useProductStore.js';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import RequirePermission from './RequirePermission.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

// Mirrors the backend search fields (name, productCode, slug, productId,
// variant attribute values, category name) so the client-side filter used
// during the live-typing lag agrees with what the server returned
const matchesSearch = (product, term) => {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  const variantValues =
    product?.variants?.flatMap(
      (variant) => variant.attributes?.map((attr) => attr?.value) || [],
    ) || [];
  return [
    product?.name,
    product?.productCode,
    product?.slug,
    product?.category?.name,
    product?.productId,
    ...variantValues,
  ].some((field) =>
    String(field ?? '')
      .toLowerCase()
      .includes(needle),
  );
};

const ViewAllProducts = () => {
  const {
    products,
    totalPages,
    totalProductsAdmin,
    allProductsCount,
    activeCount,
    inactiveCount,
    currentPage,
    loading,
    error,
    fetchProductsAdmin,
    deleteProduct,
    duplicateProduct,
  } = useProductStore();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Search / pagination state lives entirely in the URL query string, so
  // views are refresh-safe, shareable and survive back-navigation.
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const rawLimit = parseInt(searchParams.get('limit') || '10', 10) || 10;
  const limit = [5, 10, 20].includes(rawLimit) ? rawLimit : 10;
  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Exclude anything the URL doesn't support — see the whitelist in
  // updateParams — so stray values can't end up in requests
  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };

  const handleFilterChange = (name, value) =>
    updateParams({ [name]: value, page: 1 });

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  // Search only runs when the user commits it — pressing Enter or clicking
  // the search button writes the term into the URL, which triggers the fetch
  const commitSearch = () => {
    updateParams({ search: searchInput.trim(), page: 1 });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateParams({ search: '', page: 1 });
  };

  // Keep the input in sync when the URL changes (back/forward navigation,
  // sidebar links, or another page clearing/setting the search param)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    fetchProductsAdmin({ page, limit, search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, fetchProductsAdmin]);

  useEffect(() => {
    // The server already searched + paginated; filter against the committed
    // search term so the visible rows always agree with the URL. It checks
    // the same fields the backend searches (name, productCode, slug, ID,
    // variant attributes, category) for consistency.
    setFilteredProducts(
      products.filter((product) => matchesSearch(product, search)),
    );
  }, [search, products]);

  const handleOpenDialog = (id) => {
    setSelectedProductId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProductId) return;
    try {
      await deleteProduct(selectedProductId);
      toast.success(`Product ID ${selectedProductId} deleted successfully!`);
      // If the deleted row was the last one on this page, step back a page
      if (products.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        fetchProductsAdmin({ page, limit, search });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  const handleDuplicate = async (id) => {
    if (!id) return;
    try {
      await duplicateProduct(id);
      toast.success('Product duplicated successfully!');
      fetchProductsAdmin({ page, limit, search });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to duplicate product.',
      );
    }
  };

  const startItem =
    products.length > 0 && totalProductsAdmin > 0
      ? (currentPage - 1) * limit + 1
      : 0;
  const endItem = Math.max(
    startItem,
    Math.min(
      currentPage * limit,
      (currentPage - 1) * limit + filteredProducts.length,
    ),
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[400px] rounded-lg" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50">
          <CardContent className="py-4">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title={'All Products'} />
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/admin/addnewproduct')}
        >
          + Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-md border-0 border-l-4 border-l-[#00395d]">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-[#00395d]">
              {allProductsCount}
            </p>
            <p className="text-sm text-muted-foreground">All Products</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-red-600">{inactiveCount}</p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSearch();
              }}
              className="pl-9 pr-8 bg-background"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="h-9 shrink-0"
            onClick={commitSearch}
          >
            <Search className="size-4" />
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Show</p>
          <Select
            value={String(limit)}
            onValueChange={(value) => handleFilterChange('limit', value)}
          >
            <SelectTrigger className="w-16 h-8 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">entries</p>
        </div>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden md:table-cell">Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground py-8"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => (
                  <TableRow key={product._id ?? product.productId ?? index}>
                    <TableCell className="text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-muted-foreground">
                        #{product.productId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <ImageComponent
                        imageName={product?.thumbnailImage}
                        altName={product?.name}
                        skeletonHeight={30}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.name || 'No Category'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.variants?.length ? (
                        <div>
                          <p className="font-semibold">
                            ৳
                            {product.variants.length > 0
                              ? Math.min(
                                  ...product.variants.map((v) => v.price),
                                )
                              : 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.variants.length} var.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold">৳{product.finalPrice}</p>
                          {product.finalDiscount > 0 && (
                            <p className="text-xs text-destructive line-through">
                              ৳{product.finalDiscount}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            product.finalStock > 0
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {product.finalStock > 0
                            ? `${product.finalStock} in stock`
                            : 'Out of stock'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {product.flags?.length ? (
                          product.flags.map((flag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {flag?.name ?? ''}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No Flag
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? 'default' : 'secondary'}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-xs" asChild>
                              <a
                                href={`/product/${product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="size-3.5" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Product</TooltipContent>
                        </Tooltip>
                        <RequirePermission
                          permission="edit_products"
                          fallback={true}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon-xs" asChild>
                                <Link
                                  to={`/admin/edit-product/${product.slug}`}
                                  state={{
                                    from: `${location.pathname}${location.search}`,
                                  }}
                                >
                                  <Pencil className="size-3.5" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Product</TooltipContent>
                          </Tooltip>
                        </RequirePermission>
                        <RequirePermission
                          permission="add_products"
                          fallback={true}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleDuplicate(product._id)}
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate</TooltipContent>
                          </Tooltip>
                        </RequirePermission>
                        <RequirePermission
                          permission="delete_products"
                          fallback={true}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenDialog(product._id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalProductsAdmin} products
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
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAllProducts;
