import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const SubCategoryAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageBaseUrl = apiUrl.replace('/api', '') + '/uploads';
  const { token } = useAuthAdminStore();

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    isActive: true,
    showOnHomePage: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);

  const fetchSubCategories = useCallback(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/sub-category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSubCategories(res.data.subCategories || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Error fetching subcategories.');
        setLoading(false);
      });
  }, [apiUrl, token]);

  const fetchCategories = useCallback(() => {
    axios
      .get(`${apiUrl}/category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  }, [apiUrl, token]);

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, [fetchSubCategories, fetchCategories]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: '', category: '', isActive: true, showOnHomePage: false });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDialogOpen(true);
  };

  const handleOpenEdit = (subCat) => {
    setIsEdit(true);
    setEditId(subCat._id);
    setFormData({
      name: subCat.name,
      category: subCat.category?._id || '',
      isActive: subCat.isActive,
      showOnHomePage: subCat.showOnHomePage,
    });
    setImagePreview(subCat.image ? `${imageBaseUrl}/${subCat.image}` : null);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.category) {
      toast.warning('Name and category are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('isActive', formData.isActive);
      fd.append('showOnHomePage', formData.showOnHomePage);
      if (imageFile) {
        fd.append('image', imageFile);
      }
      if (isEdit) {
        await axios.put(
          `${apiUrl}/sub-category/${editId}`,
          fd,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success('Subcategory updated successfully!');
      } else {
        await axios.post(
          `${apiUrl}/sub-category`,
          fd,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success('Subcategory added successfully!');
      }
      setDialogOpen(false);
      fetchSubCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (subCat) => {
    setSubCategoryToDelete(subCat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!subCategoryToDelete) return;
    try {
      await axios.delete(`${apiUrl}/sub-category/${subCategoryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Subcategory deleted successfully!');
      fetchSubCategories();
    } catch {
      toast.error('Failed to delete subcategory.');
    } finally {
      setDeleteDialogOpen(false);
      setSubCategoryToDelete(null);
    }
  };

  const filteredSubCategories = useMemo(() => {
    return subCategories
      .filter(
        (subCat) =>
          (subCat.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (subCat.category?.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
      .reverse();
  }, [subCategories, searchTerm]);

  const pageCount = Math.ceil(filteredSubCategories.length / rowsPerPage);
  const paginated = filteredSubCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Subcategory Management'}
        action={`${subCategories.length} total subcategories`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search subcategories..."
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
          Add Subcategory
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategory Name</TableHead>
                    <TableHead className="text-center w-[100px]">
                      Image
                    </TableHead>
                    <TableHead className="text-center w-[200px]">
                      Category
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      Active
                    </TableHead>
                    <TableHead className="text-center w-[140px]">
                      Show on Home Page
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No subcategories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((subCat) => (
                      <TableRow key={subCat._id}>
                        <TableCell className="font-medium">
                          {subCat.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          {subCat.image ? (
                            <img
                              src={`${imageBaseUrl}/${subCat.image}`}
                              alt={subCat.name}
                              className="h-10 w-10 object-contain rounded"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No Image
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {subCat.category?.name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={subCat.isActive ? 'default' : 'secondary'}
                          >
                            {subCat.isActive ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              subCat.showOnHomePage ? 'default' : 'secondary'
                            }
                          >
                            {subCat.showOnHomePage ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(subCat)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => confirmDelete(subCat)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {filteredSubCategories.length > rowsPerPage && (
                <div className="flex items-center justify-between border-t border-muted-foreground/10 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {pageCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pageCount - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Subcategory' : 'Add New Subcategory'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the subcategory details.'
                : 'Create a new subcategory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Subcategory Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Smartphones"
                required
              />
              {!formData.name?.trim() && (
                <p className="text-xs text-destructive">
                  Subcategory name is required
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Show on Home Page</label>
                <Select
                  value={String(formData.showOnHomePage)}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      showOnHomePage: value === 'true',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Image <span className="text-muted-foreground">(optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-1 h-32 w-32 object-contain rounded border"
                  />
                )}
              </div>
            {isEdit && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Active</label>
                <Select
                  value={String(formData.isActive)}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      isActive: value === 'true',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{subCategoryToDelete?.name}</strong>? This action cannot
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

export default SubCategoryAllinone;
