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

  const getPlanBadgeVariant = (plan: string): "default" | "secondary" | "outline" => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'growth': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-muted text-success border-success/20';
      case 'trialing': return 'bg-info-muted text-info border-info/20';
      case 'canceled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            All Organizations
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Organization</TableHead>
                <TableHead className="font-medium">Plan</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium text-center">Numbers</TableHead>
                <TableHead className="font-medium text-center">Calls</TableHead>
                <TableHead className="font-medium text-center">Minutes</TableHead>
                <TableHead className="font-medium">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrgs.map((org) => {
                  const subscription = org.subscriptions?.[0];
                  const phoneCount = org.phone_numbers?.[0]?.count || 0;
                  const callCount = org.call_logs?.[0]?.count || 0;
                  
                  return (
                    <TableRow key={org.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{org.name}</p>
                            {org.forwarding_active && (
                              <div className="flex items-center gap-1 text-xs text-success">
                                <Phone className="h-3 w-3" />
                                Forwarding active
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(subscription?.plan || 'starter')}>
                          {(subscription?.plan || 'starter').charAt(0).toUpperCase() + (subscription?.plan || 'starter').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(subscription?.status || 'trialing')}>
                          {(subscription?.status || 'trialing').charAt(0).toUpperCase() + (subscription?.status || 'trialing').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">{phoneCount}</TableCell>
                      <TableCell className="text-center tabular-nums">{callCount}</TableCell>
                      <TableCell className="text-center tabular-nums">{subscription?.minutes_used || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Calendar className="h-3.5 w-3.5" />
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
