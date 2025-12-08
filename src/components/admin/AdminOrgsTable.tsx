import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Building2, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Organization {
  id: string;
  name: string;
  created_at: string;
  forwarding_active: boolean;
  phone_numbers: { count: number }[];
  subscriptions: { plan: string; status: string; minutes_used: number }[];
  call_logs: { count: number }[];
}

interface AdminOrgsTableProps {
  organizations: Organization[];
  loading: boolean;
}

export const AdminOrgsTable = ({ organizations, loading }: AdminOrgsTableProps) => {
  const [search, setSearch] = useState('');

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'growth': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trialing': return 'secondary';
      case 'canceled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Organizations
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Phone Numbers</TableHead>
                <TableHead className="text-center">Total Calls</TableHead>
                <TableHead className="text-center">Minutes Used</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrgs.map((org) => {
                  const subscription = org.subscriptions?.[0];
                  const phoneCount = org.phone_numbers?.[0]?.count || 0;
                  const callCount = org.call_logs?.[0]?.count || 0;
                  
                  return (
                    <TableRow key={org.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            {org.forwarding_active && (
                              <div className="flex items-center gap-1 text-xs text-emerald-600">
                                <Phone className="h-3 w-3" />
                                Forwarding active
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(subscription?.plan || 'starter')}>
                          {subscription?.plan || 'starter'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(subscription?.status || 'trialing')}>
                          {subscription?.status || 'trialing'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{phoneCount}</TableCell>
                      <TableCell className="text-center">{callCount}</TableCell>
                      <TableCell className="text-center">{subscription?.minutes_used || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(org.created_at), 'MMM d, yyyy')}
                        </div>
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
};
