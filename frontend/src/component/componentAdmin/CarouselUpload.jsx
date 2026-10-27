import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Trash2,
  Pencil,
  Link2,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CarouselUpload = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [images, setImages] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editedLink, setEditedLink] = useState('');
  const [saving, setSaving] = useState(false);

  // Pending upload (selected but not yet sent)
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
  const [pendingLink, setPendingLink] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getallcarousel`);
        setImages(response.data || []);
      } catch {
        toast.error('Failed to load slider images');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchImages();
  }, [apiUrl]);

  // Revoke the blob preview when cleared
  useEffect(() => {
    if (!pendingPreviewUrl) return;
    return () => URL.revokeObjectURL(pendingPreviewUrl);
  }, [pendingPreviewUrl]);

  const selectFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setPendingLink('');
  };

  const handleFileChange = (e) => {
    selectFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const cancelPending = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl('');
    setPendingLink('');
  };

  const confirmUpload = async () => {
    const formData = new FormData();
    formData.append('imgSrc', pendingFile);
    formData.append('link', pendingLink);

    setUploading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/createcarousel`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setImages((prev) => [...prev, response.data]);
      toast.success('Slider image added!');
      cancelPending();
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleEditOpen = (image) => {
    setEditTarget(image);
    setEditedLink(image.link || '');
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const response = await axios.patch(
        `${apiUrl}/updatecarousel/${editTarget._id}`,
        { link: editedLink },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setImages((prev) =>
        prev.map((image) =>
          image._id === editTarget._id ? response.data : image,
        ),
      );
      setEditTarget(null);
      toast.success('Link updated!');
    } catch {
      toast.error('Failed to update link');
    } finally {
      setSaving(false);
    }
  };

  const handleImageDelete = async () => {
    const imageId = deleteTarget;
    try {
      await axios.delete(`${apiUrl}/deletebyidcarousel/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages((prev) => prev.filter((image) => image._id !== imageId));
      toast.success('Slider image deleted!');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Slider Images"
          description="Manage homepage carousel images and their links"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Slider Images"
        description={`${images.length} slider image${images.length === 1 ? '' : 's'}`}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {images.map((image) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group overflow-hidden rounded-lg bg-card shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-[16/9]">
                <ImageComponent
                  imageName={image.imgSrc}
                  className="absolute inset-0 size-full object-cover"
                  skeletonHeight={150}
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Button size="sm" onClick={() => handleEditOpen(image)}>
                    <Pencil className="size-4" />
                    Edit Link
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(image._id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-muted/40 px-3 py-2.5 text-sm">
                {image.link ? (
                  <a
                    href={image.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Link2 className="size-3.5 shrink-0" />
                    <span className="truncate hover:underline">
                      {image.link}
                    </span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleEditOpen(image)}
                    className="flex flex-1 items-center gap-1.5 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                  >
                    <Link2 className="size-3.5 shrink-0" />
                    No link — click to add
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed py-12 text-center">
            <ImageIcon className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No slider images yet. Upload your first one below.
            </p>
          </div>
        )}
      </div>

      {/* Drop zone (filtered out while a preview is being staged) */}
      {!pendingFile && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <UploadCloud
            className={`size-8 ${dragActive ? 'text-primary' : 'text-muted-foreground/60'}`}
          />
          <span className="mt-2 text-sm font-medium">
            Drag &amp; drop an image here, or click to browse
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

      {/* Preview before upload */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <img
                src={pendingPreviewUrl}
                alt="Preview"
                className="aspect-[16/9] w-full rounded-md object-cover sm:w-48"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="upload-link">Link (optional)</Label>
                  <Input
                    id="upload-link"
                    type="url"
                    placeholder="https://example.com/collection"
                    value={pendingLink}
                    onChange={(e) => setPendingLink(e.target.value)}
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {pendingFile.name} ·{' '}
                  {(pendingFile.size / 1024).toFixed(0)} KB
                </p>
                <div className="mt-auto flex gap-2">
                  <Button
                    onClick={confirmUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelPending}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit link dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Link</DialogTitle>
            <DialogDescription>
              Paste the URL this slider image should navigate to, or clear it to
              remove the link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-1">
            <Label htmlFor="edit-link">Link URL</Label>
            <Input
              id="edit-link"
              type="url"
              placeholder="https://example.com/collection"
              value={editedLink}
              onChange={(e) => setEditedLink(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slider Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slider image? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleImageDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarouselUpload;
