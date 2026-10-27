import { Suspense, lazy, useEffect, useRef, useState } from 'react';
const Editor = lazy(() =>
  import('primereact/editor').then((module) => ({
    default: module.Editor,
  })),
);
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const PageEditor = ({ title, endpoint }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const htmlRef = useRef('');
  const { token } = useAuthAdminStore();

  useEffect(() => {
    let cancelled = false;
    htmlRef.current = '';
    setContent('');
    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/pagecontent/${endpoint}`,
        );
        if (!cancelled && res.data?.content) {
          setContent(res.data.content);
          htmlRef.current = res.data.content;
        }
      } catch (err) {
        console.error(`Error fetching ${title} content:`, err);
      }
    };
    fetchContent();
    return () => {
      cancelled = true;
    };
  }, [endpoint, title]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/pagecontent/${endpoint}`,
        { content: htmlRef.current },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`${title} updated successfully!`);
    } catch (err) {
      console.error(`Update error for ${title}:`, err);
      toast.error('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={`Edit ${title}`} />

      <Card className="shadow-md border-0">
        <CardContent>
          <Suspense
            fallback={
              <div className="py-8 text-center text-muted-foreground">
                Loading Editor...
              </div>
            }
          >
            <Editor
              key={`${endpoint}-${content || 'initial'}`}
              value={content}
              onTextChange={(e) => {
                htmlRef.current = e.htmlValue ?? '';
              }}
              style={{ height: '500px' }}
              readOnly={loading}
            />
          </Suspense>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-4">
        <Button onClick={handleSave} disabled={loading} className="w-96">
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default PageEditor;
