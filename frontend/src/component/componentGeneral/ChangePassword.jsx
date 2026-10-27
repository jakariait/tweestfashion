import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Paper } from '@/components/ui/paper';
import { Typography } from '@/components/ui/typography';
import { CircularProgress } from '@/components/ui/circular-progress';
import { KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ChangePassword = ({ token }) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const changePasswordUrl = `${baseUrl}/change-password`;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (!formData.currentPassword || !formData.newPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch(
        changePasswordUrl,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.data.message) {
        setSuccess(res.data.message);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setError('Failed to change password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Paper className="max-w-md w-full mt-6">
        <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-border/50">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="size-5 text-primary" />
          </div>
          <Typography variant="h5" className="font-semibold">
            Change Password
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <TextField
              label="Current Password"
              name="currentPassword"
              type={showPasswords ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <TextField
            label="New Password"
            name="newPassword"
            type={showPasswords ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <TextField
            label="Confirm New Password"
            name="confirmNewPassword"
            type={showPasswords ? 'text' : 'password'}
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPasswords ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {showPasswords ? 'Hide' : 'Show'} passwords
          </button>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <CircularProgress className="size-4 mr-2" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ChangePassword;
