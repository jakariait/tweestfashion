import { useState, useEffect } from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookMessenger,
  FaWhatsapp,
  FaTelegram,
  FaYoutube,
  FaTiktok,
  FaPinterest,
  FaViber,
} from 'react-icons/fa';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const apiUrl = import.meta.env.VITE_API_URL;

const SOCIAL_PLATFORMS = [
  {
    key: 'facebook',
    icon: (
      <FaFacebook className="size-5 shrink-0" style={{ color: '#1877F2' }} />
    ),
    label: 'Facebook',
  },
  {
    key: 'twitter',
    icon: (
      <FaTwitter className="size-5 shrink-0" style={{ color: '#1DA1F2' }} />
    ),
    label: 'Twitter',
  },
  {
    key: 'instagram',
    icon: (
      <FaInstagram className="size-5 shrink-0" style={{ color: '#E1306C' }} />
    ),
    label: 'Instagram',
  },
  {
    key: 'linkedin',
    icon: (
      <FaLinkedin className="size-5 shrink-0" style={{ color: '#0077B5' }} />
    ),
    label: 'LinkedIn',
  },
  {
    key: 'messenger',
    icon: (
      <FaFacebookMessenger
        className="size-5 shrink-0"
        style={{ color: '#00B2FF' }}
      />
    ),
    label: 'Messenger',
  },
  {
    key: 'whatsapp',
    icon: (
      <FaWhatsapp className="size-5 shrink-0" style={{ color: '#25D366' }} />
    ),
    label: 'WhatsApp',
  },
  {
    key: 'telegram',
    icon: (
      <FaTelegram className="size-5 shrink-0" style={{ color: '#0088CC' }} />
    ),
    label: 'Telegram',
  },
  {
    key: 'youtube',
    icon: (
      <FaYoutube className="size-5 shrink-0" style={{ color: '#FF0000' }} />
    ),
    label: 'YouTube',
  },
  {
    key: 'tiktok',
    icon: <FaTiktok className="size-5 shrink-0" />,
    label: 'TikTok',
  },
  {
    key: 'pinterest',
    icon: (
      <FaPinterest className="size-5 shrink-0" style={{ color: '#E60023' }} />
    ),
    label: 'Pinterest',
  },
  {
    key: 'viber',
    icon: <FaViber className="size-5 shrink-0" style={{ color: '#7360F2' }} />,
    label: 'Viber',
  },
];

const DEFAULT_LINKS = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, '']),
);

const SocialMediaLinks = () => {
  const { token } = useAuthAdminStore();

  const [links, setLinks] = useState({ ...DEFAULT_LINKS });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/socialmedia`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        const socialLinks = result.data;
        setLinks((prev) => ({ ...prev, ...socialLinks }));
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLinks((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/socialmedia`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(links),
      });

      if (!response.ok) throw new Error('Failed to update data');

      const result = await response.json();
      const socialLinks = result.data;
      setLinks((prev) => ({ ...prev, ...socialLinks }));
      toast.success(result.message || 'Social media links updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Social Media Links'}
        description={' Manage your social media presence links.'}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Platform Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {SOCIAL_PLATFORMS.map(({ key, icon, label }) => (
                <div key={key} className="flex items-center gap-3">
                  {icon}
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={key} className="text-xs font-medium">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      name={key}
                      value={links[key]}
                      onChange={handleChange}
                      placeholder={`https://${key}.com/...`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              'Update Social Links'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SocialMediaLinks;
