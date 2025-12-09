import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Mail, Phone, Building2, MessageSquare, Check, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  notes: string | null;
}

export const AdminContactRequests = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast.error('Failed to load contact requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ 
          status, 
          responded_at: status === 'responded' ? new Date().toISOString() : null 
        })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.map(r => 
        r.id === id ? { ...r, status, responded_at: status === 'responded' ? new Date().toISOString() : null } : r
      ));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.filter(r => r.id !== id));
      toast.success('Request deleted');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-info/20 text-info border-info/30">New</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning/20 text-warning border-warning/30">In Progress</Badge>;
      case 'responded':
        return <Badge className="bg-success/20 text-success border-success/30">Responded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Contact Requests</h3>
            <Badge variant="secondary" className="ml-2">{requests.length}</Badge>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No contact requests yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">Contact</TableHead>
                <TableHead className="text-muted-foreground">Company</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <>
                  <TableRow 
                    key={request.id} 
                    className={cn(
                      "cursor-pointer transition-colors",
                      expandedId === request.id && "bg-muted/30"
                    )}
                    onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{request.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.email}
                          </span>
                          {request.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {request.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.company ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {request.company}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                      <br />
                      <span className="text-xs">{format(new Date(request.created_at), 'HH:mm')}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {request.status !== 'responded' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-2 text-success hover:text-success hover:bg-success/10"
                            onClick={() => updateStatus(request.id, 'responded')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {request.status === 'new' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-2 text-warning hover:text-warning hover:bg-warning/10"
                            onClick={() => updateStatus(request.id, 'in_progress')}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(request.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === request.id && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={5} className="py-4">
                        <div className="pl-4 border-l-2 border-primary/30">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Message:</p>
                          <p className="text-foreground whitespace-pre-wrap">{request.message}</p>
                          {request.responded_at && (
                            <p className="text-xs text-muted-foreground mt-3">
                              Responded on {format(new Date(request.responded_at), 'MMM d, yyyy HH:mm')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact request?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The contact request will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteRequest(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};