import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Mail, Search, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  organization_id: string | null;
  organization?: { name: string } | null;
  status: string;
  resend_id: string | null;
  created_at: string;
  error_message: string | null;
}

interface AdminEmailsTableProps {
  emails: EmailLog[];
  loading: boolean;
}

const emailTypeConfig: Record<string, { label: string; color: string }> = {
  'team-invitation': { label: 'Invitation', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  'welcome': { label: 'Welcome', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'missed-call-alert': { label: 'Missed Call', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export function AdminEmailsTable({ emails, loading }: AdminEmailsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || email.email_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: emails.length,
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Email Logs</CardTitle>
          </div>
          
          {/* Stats badges */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              Total: {stats.total}
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-normal">
              Sent: {stats.sent}
            </Badge>
            {stats.failed > 0 && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-normal">
                Failed: {stats.failed}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email, subject, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="team-invitation">Invitation</SelectItem>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="missed-call-alert">Missed Call</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden lg:table-cell">Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {emails.length === 0 ? 'No emails sent yet' : 'No emails match your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmails.map((email) => {
                  const typeInfo = emailTypeConfig[email.email_type] || { label: email.email_type, color: 'bg-gray-100 text-gray-800' };
                  
                  return (
                    <TableRow key={email.id} className="group">
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px]">
                          {email.recipient_email}
                        </div>
                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                          {format(new Date(email.created_at), 'MMM d, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} font-normal`}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-[250px] text-sm">
                          {email.subject}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {email.organization?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {email.status === 'sent' ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Sent</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600" title={email.error_message || 'Failed'}>
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Failed</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(email.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
