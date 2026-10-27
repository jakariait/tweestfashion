import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const AdminCategoryAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageBaseUrl = apiUrl.replace('/api', '') + '/uploads';
  const { token } = useAuthAdminStore();

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
    showOnNavbar: true,
    showOnHomePage: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCategories(res.data.categories || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Error fetching categories.');
        setLoading(false);
      });
  }, [apiUrl, token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: '', showOnNavbar: true, showOnHomePage: false });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEdit(true);
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      showOnNavbar: cat.showOnNavbar,
      showOnHomePage: cat.showOnHomePage,
    });
    setImagePreview(cat.image ? `${imageBaseUrl}/${cat.image}` : null);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning('Category name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('showOnNavbar', formData.showOnNavbar);
      fd.append('showOnHomePage', formData.showOnHomePage);
      if (imageFile) {
        fd.append('image', imageFile);
      }
      if (isEdit) {
        await axios.put(`${apiUrl}/category/${editId}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category updated successfully!');
      } else {
        await axios.post(`${apiUrl}/category`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Category added successfully!');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`${apiUrl}/category/${categoryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category.');
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) =>
        (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .reverse();
  }, [categories, searchTerm]);

  const pageCount = Math.ceil(filteredCategories.length / rowsPerPage);
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Category Management'}
        description={`${categories.length} total categories`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
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
          Add Category
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
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-center w-[100px]">
                      Image
                    </TableHead>
                    <TableHead className="text-center w-[140px]">
                      Show on Navbar
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
                  {paginatedCategories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCategories.map((cat) => (
                      <TableRow key={cat._id}>
                        <TableCell className="font-medium">
                          {cat.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {cat.image ? (
                            <img
                              src={`${imageBaseUrl}/${cat.image}`}
                              alt={cat.name}
                              className="h-10 w-10 object-contain rounded"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No Image
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={cat.showOnNavbar ? 'default' : 'secondary'}
                          >
                            {cat.showOnNavbar ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={cat.showOnHomePage ? 'default' : 'secondary'}
                          >
                            {cat.showOnHomePage ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(cat)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => confirmDelete(cat)}
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

              {filteredCategories.length > rowsPerPage && (
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
              {isEdit ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the category details.'
                : 'Create a new category.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Category Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Electronics"
                required
              />
              {!formData.name.trim() && (
                <p className="text-xs text-destructive">
                  Category name is required
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Show on Navbar</label>
                <Select
                  value={String(formData.showOnNavbar)}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      showOnNavbar: value === 'true',
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{categoryToDelete?.name}</strong>? This action cannot be
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

export default AdminCategoryAllinone;
