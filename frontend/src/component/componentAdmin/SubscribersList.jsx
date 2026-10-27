import { useState, useEffect } from 'react';
import useNewsletterStore from '../../store/useNewsletterStore.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Search, Trash2, Download } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

export default function SubscribersList() {
  const { subscribers, fetchSubscribers, deleteSubscriber, isLoading, error } =
    useNewsletterStore();

  const [search, setSearch] = useState('');
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    setFilteredSubscribers(
      subscribers.filter((sub) =>
        (sub.email || sub.Email || '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    );
  }, [search, subscribers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const email = deleteTarget.email || deleteTarget.Email;
    await deleteSubscriber(email);

    if (!error) {
      toast.success('Subscriber deleted successfully!');
      fetchSubscribers();
    } else {
      toast.error('Failed to delete subscriber!');
    }

    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Subscribed Users List'}
        description={`${subscribers.length} total subscribers`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <CSVLink
          data={filteredSubscribers.map((sub) => ({
            Email: sub.email || sub.Email,
          }))}
          headers={[{ label: 'Email', key: 'Email' }]}
          filename={'subscribers.csv'}
        >
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-2" />
            Download CSV
          </Button>
        </CSVLink>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">SL</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed On</TableHead>
                  <TableHead className="w-[70px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((sub, index) => (
                    <TableRow key={sub._id || index}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sub.email || sub.Email}
                      </TableCell>
                      <TableCell>
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setDeleteTarget(sub);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber?
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
}
