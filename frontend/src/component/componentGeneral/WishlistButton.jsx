import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import useWishlistStore from '../../store/useWishlistStore.js';
import useAuthUserStore from '../../store/AuthUserStore.js';

const WishlistButton = ({ product, size = 24, className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuthUserStore();
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    initialize,
    initialized,
  } = useWishlistStore();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const productId = product?._id;

  useEffect(() => {
    if (user && !initialized) {
      initialize();
    }
  }, [user, initialized, initialize]);

  useEffect(() => {
    if (wishlist && productId) {
      const inWishlist = wishlist.some(
        (item) => item.product?._id === productId || item.product === productId,
      );
      setIsInWishlist(inWishlist);
    }
  }, [wishlist, productId]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    setLoading(true);

    if (isInWishlist) {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist!');
    } else {
      await addToWishlist(productId);
      toast.success('Added to wishlist!');
    }

    setLoading(false);
  };

  const handleLogin = () => {
    setLoginDialogOpen(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setLoginDialogOpen(false);
    navigate('/register');
  };

  return (
    <>
      <button
        onClick={handleWishlistClick}
        disabled={loading}
        className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
          isInWishlist
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-red-500 '
        } ${className}`}
        style={{ width: size + 16, height: size + 16 }}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={size}
          className={`transition-transform duration-200 ${
            isInWishlist ? 'fill-current' : ''
          }`}
        />
      </button>

      <Dialog
        open={loginDialogOpen}
        onOpenChange={(o) => !o && setLoginDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-sm text-center py-8">
          <Heart
            size={48}
            className="mx-auto mb-4 text-red-500"
            fill="currentColor"
          />
          <h2 className="text-xl font-bold mb-2">Save to Wishlist</h2>
          <p className="text-gray-600 mb-2">Login to Save Your Favorites</p>
          <p className="text-gray-500 text-sm mb-6">
            Create a wishlist to save items you love and access them anytime.
          </p>
          <button
            fullWidth
            onClick={handleLogin}
            className="mb-3 primaryBgColor accentTextColor px-4 py-2 rounded cursor-pointer"
          >
            Login Now
          </button>
          <p className="text-sm text-gray-600">
            New here?{' '}
            <span
              onClick={handleRegister}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Create an account
            </span>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WishlistButton;
