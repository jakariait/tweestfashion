import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Paper } from '@/components/ui/paper';
import { Typography } from '@/components/ui/typography';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Trash2 as DeleteIcon,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const UpdateUserForm = ({ token }) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const apiUrl = `${baseUrl}/profile`;
  const updateUrl = `${baseUrl}/updateUser`;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
    userImage: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setFetching(true);
      try {
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user || res.data;
        setUserId(user._id);
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          address: user.address || '',
          phone: user.phone || '',
          userImage: user?.userImage || null,
        });
        setPreviewImage(null);
        setImageRemoved(false);
      } catch (err) {
        setError('Failed to fetch user data.');
        console.error('Fetch user error:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [token, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, userImage: file }));
      setPreviewImage(URL.createObjectURL(file));
      setImageRemoved(false);
    } else {
      setPreviewImage(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, userImage: null }));
    setPreviewImage(null);
    setImageRemoved(true);
  };

  const getImageSource = () => {
    if (previewImage) return previewImage;
    if (formData.userImage && typeof formData.userImage === 'string') {
      const staticBaseUrl = baseUrl.endsWith('/api')
        ? baseUrl.slice(0, -4)
        : baseUrl;
      return `${staticBaseUrl}/uploads/${formData.userImage}`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!userId) {
      setError('User ID not available. Cannot update profile.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('address', formData.address);
      data.append('phone', formData.phone);

      if (imageRemoved) {
        data.append('userImage', '');
      } else if (formData.userImage instanceof File) {
        data.append('userImage', formData.userImage);
      }

      const res = await axios.put(`${updateUrl}/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.message) {
        setSuccess(res.data.message);
        if (res.data.user && res.data.user.userImage) {
          setFormData((prev) => ({
            ...prev,
            userImage: res.data.user.userImage,
          }));
          setPreviewImage(null);
          setImageRemoved(false);
        } else if (imageRemoved) {
          setFormData((prev) => ({ ...prev, userImage: null }));
          setPreviewImage(null);
          setImageRemoved(false);
        }
      } else {
        setError('Failed to update user.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong during update.',
      );
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <CircularProgress />
      </div>
    );
  }

  const currentImageSrc = getImageSource();

  return (
    <Paper className="max-w-lg mx-auto">
      <div className="px-6 pt-6 pb-5 border-b border-border/50">
        <Typography variant="h5" className="font-semibold text-center">
          Update Your Profile
        </Typography>
      </div>

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-600/20">
          <CheckCircle2 className="size-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="flex flex-col items-center gap-3">
          {currentImageSrc ? (
            <img
              src={currentImageSrc}
              alt="User Profile"
              className="size-28 rounded-full object-cover ring-4 ring-border shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`size-28 rounded-full bg-muted flex items-center justify-center text-muted-foreground ${currentImageSrc ? 'hidden' : ''}`}
          >
            <User className="size-10" />
          </div>

          <div className="flex gap-2">
            <input
              accept="image/*"
              id="user-image-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="user-image-upload">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="cursor-pointer"
              >
                <span>
                  <Upload className="size-3.5 mr-1.5" />
                  Upload Image
                </span>
              </Button>
            </label>
            {(currentImageSrc || previewImage) && (
              <Button variant="outline" size="sm" onClick={handleRemoveImage}>
                <DeleteIcon className="size-3.5 mr-1.5" />
                Remove
              </Button>
            )}
          </div>
        </div>

        <TextField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <TextField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <CircularProgress className="size-4 mr-2" />
              Updating...
            </>
          ) : (
            'Update Profile'
          )}
        </Button>
      </form>
    </Paper>
  );
};

export default UpdateUserForm;
