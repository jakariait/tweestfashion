import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Minus,
} from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const ProductOptionsAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', values: [{ value: '', numberOfProduct: 1 }] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState(null);

  const fetchProductOptions = useCallback(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/product-options`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProductOptions(res.data.productOptions || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Error fetching product options.');
        setLoading(false);
      });
  }, [apiUrl, token]);

  useEffect(() => {
    fetchProductOptions();
  }, [fetchProductOptions]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: '', values: [{ value: '', numberOfProduct: 1 }] });
    setDialogOpen(true);
  };

  const handleOpenEdit = (option) => {
    setIsEdit(true);
    setEditId(option._id);
    setFormData({
      name: option.name,
      values: (option.values || []).map((v) => {
        const plain = v && typeof v === 'object' && !Array.isArray(v)
          ? (v.toObject ? v.toObject() : v)
          : {};
        return {
          value: plain.value !== undefined ? plain.value : v,
          numberOfProduct: plain.numberOfProduct ?? 1,
        };
      }),
    });
    setDialogOpen(true);
  };

  const addValueRow = () => {
    setFormData({
      ...formData,
      values: [...formData.values, { value: '', numberOfProduct: 1 }],
    });
  };

  const removeValueRow = (index) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  };

  const updateValueRow = (index, field, value) => {
    const newValues = [...formData.values];
    newValues[index][field] = value;
    setFormData({ ...formData, values: newValues });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning('Name is required.');
      return;
    }
    const valuesArray = formData.values.filter((v) => typeof v.value === 'string' && v.value.trim());
    if (valuesArray.length === 0) {
      toast.warning('At least one value is required.');
      return;
    }
    for (const v of valuesArray) {
      const num = Number(v.numberOfProduct);
      if (!Number.isInteger(num) || num < 1) {
        toast.warning('Number of product must be a positive integer.');
        return;
      }
    }
    const payload = {
      name: formData.name,
      values: valuesArray.map((v) => ({
        value: v.value.trim(),
        numberOfProduct: Number(v.numberOfProduct),
      })),
    };
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await axios.put(
          `${apiUrl}/product-options/${editId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        toast.success('Product option updated successfully!');
      } else {
        await axios.post(
          `${apiUrl}/product-options`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        toast.success('Product option added successfully!');
      }
      setDialogOpen(false);
      fetchProductOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (option) => {
    setOptionToDelete(option);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!optionToDelete) return;
    try {
      await axios.delete(`${apiUrl}/product-options/${optionToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product option deleted successfully!');
      fetchProductOptions();
    } catch {
      toast.error('Failed to delete product option.');
    } finally {
      setDeleteDialogOpen(false);
      setOptionToDelete(null);
    }
  };

  const filteredOptions = useMemo(() => {
    return productOptions
      .filter((opt) =>
        (opt.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .reverse();
  }, [productOptions, searchTerm]);

  const pageCount = Math.ceil(filteredOptions.length / rowsPerPage);
  const paginatedOptions = filteredOptions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Product Option Management"
        description={`${productOptions.length} total options`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
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
          Add Option
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
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Values</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOptions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No product options found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOptions.map((opt) => (
                      <TableRow key={opt._id}>
                        <TableCell className="font-medium">
                          {opt.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(opt.values || []).map((val, idx) => {
                              let valueText = '';
                              let count = 1;
                              if (val) {
                                if (typeof val === 'object' && !Array.isArray(val)) {
                                  const obj = val.toObject ? val.toObject() : val;
                                  valueText = obj.value != null ? String(obj.value) : '';
                                  count = obj.numberOfProduct != null ? obj.numberOfProduct : 1;
                                } else {
                                  valueText = String(val);
                                }
                              }
                              return (
                                <Badge key={idx} variant="outline">
                                  {valueText} ({count})
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(opt)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(opt)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {filteredOptions.length > rowsPerPage && (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Product Option' : 'Add New Product Option'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the name and values for this option.'
                : 'Create a new product option with comma-separated values.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Size, Color"
                required
              />
              {!formData.name.trim() && (
                <p className="text-xs text-destructive">Name is required</p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="values"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Values
              </label>
              <div className="space-y-2">
                {formData.values.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 border border-input p-2 rounded-md bg-background"
                  >
                    <Input
                      id={`value-${idx}`}
                      value={val.value}
                      onChange={(e) => updateValueRow(idx, 'value', e.target.value)}
                      placeholder="e.g., Small"
                      required
                    />
                    <Input
                      id={`numberOfProduct-${idx}`}
                      type="number"
                      min="1"
                      value={val.numberOfProduct}
                      onChange={(e) => updateValueRow(idx, 'numberOfProduct', e.target.value)}
                      placeholder="1"
                      className="w-20"
                      required
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeValueRow(idx)}
                      disabled={formData.values.length === 1}
                    >
                      <Minus className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addValueRow}>
                  <Plus className="size-3 mr-1" />
                  Add value
                </Button>
              </div>
              {!formData.values.some((v) => typeof v.value === 'string' && v.value.trim()) ? (
                <p className="text-xs text-destructive">At least one value is required</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Each value has its own number of products (default 1).
                </p>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete option{' '}
              <strong>{optionToDelete?.name}</strong>? This action cannot be
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

export default ProductOptionsAllinone;
