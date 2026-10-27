import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Loader2, Pencil, UploadCloud, ImageIcon } from 'lucide-react';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const apiUrl = import.meta.env.VITE_API_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FeatureImageAdmin = () => {
  const { token } = useAuthAdminStore();

  const [featureImages, setFeatureImages] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);

  // form state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchFeatureImages = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/feature-images`);
        setFeatureImages(data.data || []);
      } catch {
        toast.error('Failed to load feature images');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchFeatureImages();
  }, []);

  useEffect(() => {
    if (!filePreviewUrl) return;
    return () => URL.revokeObjectURL(filePreviewUrl);
  }, [filePreviewUrl]);

  const applyImage = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!editingFeature && !file) {
      toast.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    if (file) formData.append('imgSrc', file);

    setSubmitting(true);
    try {
      if (editingFeature) {
        await axios.put(
          `${apiUrl}/feature-images/${editingFeature._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success('Feature image updated successfully!');
      } else {
        await axios.post(`${apiUrl}/feature-images/create`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Feature image added successfully!');
      }

      const { data: refreshData } = await axios.get(`${apiUrl}/feature-images`);
      setFeatureImages(refreshData.data || []);
      resetForm();
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingFeature(null);
    setTitle('');
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl('');
    setDragActive(false);
  };

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFile(selectedFile);
    setFilePreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e) => {
    selectFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setTitle(feature.title);
    setFile(null);
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl('');
  };

  const handleDelete = async () => {
    const id = deleteTarget;
    try {
      await axios.delete(`${apiUrl}/feature-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeatureImages((prev) => prev.filter((item) => item._id !== id));
      toast.success('Feature image deleted successfully!');
    } catch {
      toast.error('Failed to delete image.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Feature Images"
          description="Manage the feature images shown to customers"
        />
        <Skeleton className="h-80 rounded-lg" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Feature Images"
        description={`${featureImages.length} feature image${featureImages.length === 1 ? '' : 's'}`}
      />

      <div className="rounded-lg bg-card p-6 shadow-md">
        <h2 className="text-base font-semibold">
          {editingFeature ? (
            <span className="flex items-center gap-2">
              <Pencil className="size-4" />
              Edit “{editingFeature.title}”
            </span>
          ) : (
            'Add Feature Image'
          )}
        </h2>

        <div className="mt-4 space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter feature title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {!filePreviewUrl && (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <UploadCloud
                className={`size-7 ${dragActive ? 'text-primary' : 'text-muted-foreground/60'}`}
              />
              <span className="mt-2 text-sm font-medium">
                {editingFeature
                  ? 'Drop to replace image (or keep the current one)'
                  : 'Drag & drop an image here, or click to browse'}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG or WEBP — up to 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {(filePreviewUrl || editingFeature?.imgSrc) && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs text-muted-foreground">
              {filePreviewUrl ? 'New image preview:' : 'Current image:'}
            </p>
            <div className="flex items-center gap-3">
              <div className="h-40 w-72 overflow-hidden rounded-md bg-muted/30">
                {filePreviewUrl ? (
                  <img
                    src={filePreviewUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageComponent
                    imageName={editingFeature.imgSrc}
                    className="h-full w-full object-contain"
                    skeletonHeight={160}
                  />
                )}
              </div>
              <div className="min-w-0">
                <Label className="text-muted-foreground">Title</Label>
                <p className="mt-1 truncate text-sm font-semibold">
                  {title || editingFeature?.title}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button onClick={applyImage} disabled={submitting}>
            {submitting && <Loader2 className="mr-1 size-4 animate-spin" />}
            {editingFeature
              ? submitting
                ? 'Updating...'
                : 'Update Image'
              : submitting
                ? 'Adding...'
                : 'Add Image'}
          </Button>
          {editingFeature && (
            <Button variant="outline" onClick={resetForm} disabled={submitting}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid h-100 auto-rows-fr grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
        {featureImages.map((feature) => (
          <div
            key={feature._id}
            className="group grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-lg bg-card shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="relative min-h-0 overflow-hidden bg-muted/30">
              <ImageComponent
                imageName={feature.imgSrc}
                className="h-full w-full object-contain"
                skeletonHeight={120}
              />

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button size="sm" onClick={() => handleEdit(feature)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteTarget(feature._id)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
            <div className="self-end px-4 py-3">
              <h3 className="truncate text-center text-sm font-semibold">
                {feature.title}
              </h3>
            </div>
          </div>
        ))}

        {featureImages.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed py-12 text-center">
            <ImageIcon className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No feature images yet. Add your first one above.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feature Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feature image? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
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

export default FeatureImageAdmin;
