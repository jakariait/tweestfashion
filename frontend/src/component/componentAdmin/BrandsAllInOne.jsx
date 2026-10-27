import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  PackageSearch,
} from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';
import Skeleton from 'react-loading-skeleton';

const BrandsAllInOne = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageBaseUrl = apiUrl.replace('/api', '') + '/uploads';
  const { token } = useAuthAdminStore();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', isTopBrand: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const fileInputRef = useRef(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const fetchBrands = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/brands`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBrands(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Error fetching brands.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: '', isTopBrand: false });
    setLogoPreview(null);
    setLogoFile(null);
    setLogoRemoved(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setIsEdit(true);
    setEditId(brand._id);
    setFormData({ name: brand.name, isTopBrand: brand.isTopBrand });
    setLogoPreview(brand.logo ? `${imageBaseUrl}/${brand.logo}` : null);
    setLogoFile(null);
    setLogoRemoved(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning('Brand name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('isTopBrand', formData.isTopBrand);
      if (logoFile) {
        fd.append('logo', logoFile);
      }

      if (isEdit) {
        await axios.put(`${apiUrl}/brands/${editId}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Brand updated successfully!');
      } else {
        await axios.post(`${apiUrl}/brands`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Brand added successfully!');
      }
      setDialogOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    try {
      await axios.delete(`${apiUrl}/brands/${brandToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Brand deleted successfully!');
      fetchBrands();
    } catch {
      toast.error('Failed to delete brand.');
    } finally {
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  const filteredBrands = useMemo(() => {
    return brands
      .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .reverse();
  }, [brands, searchTerm]);

  const pageCount = Math.ceil(filteredBrands.length / rowsPerPage);
  const paginatedBrands = filteredBrands.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <SectionHeader
        title={'Brand Management'}
        description={`${brands.length} total brands`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1" />
          Add Brand
        </Button>
      </div>

      {loading ? (
        <div className="grid content-start flex-1 grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-2">
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {paginatedBrands.length === 0 ? (
            <Card className="flex-1">
              <CardContent className="flex h-full flex-col justify-center p-0">
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <PackageSearch className="size-10 opacity-40" />
                  <p className="text-sm">No brands found.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid content-start flex-1 grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {paginatedBrands.map((brand) => (
                <Card
                  key={brand._id}
                  className="group relative overflow-hidden "
                >
                  <CardContent className="p-0">
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden">
                      {brand.isTopBrand && (
                        <span className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-[11px] font-semibold text-yellow-900 shadow-sm">
                          <Star className="size-3 fill-yellow-900" />
                          Top
                        </span>
                      )}
                      {brand.logo ? (
                        <img
                          src={`${imageBaseUrl}/${brand.logo}`}
                          alt={brand.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-2 "
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No Logo
                        </span>
                      )}

                      <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          className="shadow-sm"
                          onClick={() => handleOpenEdit(brand)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon-xs"
                          className="text-destructive shadow-sm hover:text-destructive"
                          onClick={() => confirmDelete(brand)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="flex items-center justify-center gap-1 px-2 py-2 -mb-6 text-center text-sm font-medium">
                      {brand.isTopBrand && (
                        <Star className="size-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                      )}
                      <span className="truncate">{brand.name}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredBrands.length > rowsPerPage && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-muted-foreground/10 px-4 py-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                  {paginatedBrands.length}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                  {filteredBrands.length}
                </span>{' '}
                brands
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  {page + 1} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the brand details.' : 'Create a new brand.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Brand Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Samsung"
                required
              />
              {!formData.name.trim() && (
                <p className="text-xs text-destructive">
                  Brand name is required
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Top Brand</label>
              <input
                type="checkbox"
                checked={formData.isTopBrand}
                onChange={(e) =>
                  setFormData({ ...formData, isTopBrand: e.target.checked })
                }
                className="size-4 accent-[var(--primaryColor)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Logo <span className="text-muted-foreground">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="flex-1"
                />
                {logoPreview && (
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      setLogoRemoved(true);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="mt-1 h-32 w-32 object-contain rounded border"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                'Update'
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{brandToDelete?.name}</strong>? This action cannot be
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsAllInOne;
