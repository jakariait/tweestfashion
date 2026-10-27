import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, X, Loader2, MessagesSquare } from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const MarqueeAdmin = () => {
  const { token } = useAuthAdminStore();
  const [messages, setMessages] = useState(['']);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL}/marquee`;

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setMessages(res.data.messages || ['']);
          setIsActive(res.data.isActive);
        }
      } catch (err) {
        console.error('Failed to fetch marquee data:', err.message);
      }
    };

    if (token) fetchMarquee();
  }, [token, API_URL]);

  const handleInputChange = (index, value) => {
    const updated = [...messages];
    updated[index] = value;
    setMessages(updated);
  };

  const addMessage = () => setMessages([...messages, '']);
  const removeMessage = (index) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated.length ? updated : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(
        API_URL,
        { messages, isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success('Marquee updated successfully!');
    } catch {
      toast.error('Failed to update marquee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Marquee Messages'}
        description={'Manage scrolling announcement messages.'}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="size-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={msg}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Message ${index + 1}`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMessage(index)}
                  className="text-destructive hover:text-destructive shrink-0"
                  disabled={messages.length === 1}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMessage}
            >
              <Plus className="size-4 mr-1" />
              Add Message
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <Label htmlFor="isActive">Active</Label>
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
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MarqueeAdmin;
