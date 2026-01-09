import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { HealthStatusBadge } from './HealthStatusBadge';
import { AccountHealthDetails } from './AccountHealthDetails';
import { CheckCircle, XCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { AccountHealth } from '@/hooks/useAccountHealth';
import { format } from 'date-fns';

interface AccountHealthTableProps {
  accounts: AccountHealth[];
  isLoading: boolean;
}

export function AccountHealthTable({ accounts, isLoading }: AccountHealthTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'health_score' | 'created_at'>('health_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAccounts = accounts
    .filter((account) => {
      const matchesSearch =
        account.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || account.health_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'health_score') {
        return (a.health_score - b.health_score) * modifier;
      }
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier;
    });

  const toggleSort = (field: 'health_score' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: 'health_score' | 'created_at' }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('health_score')}
                  className="flex items-center hover:text-foreground"
                >
                  Health Score
                  <SortIcon field="health_score" />
                </button>
              </TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Settings</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('created_at')}
                  className="flex items-center hover:text-foreground"
                >
                  Created
                  <SortIcon field="created_at" />
                </button>
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <>
                  <TableRow
                    key={account.user_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedRow(expandedRow === account.user_id ? null : account.user_id)
                    }
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{account.display_name}</div>
                        <div className="text-sm text-muted-foreground">{account.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <HealthStatusBadge status={account.health_status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={account.health_score} className="w-16 h-2" />
                        <span className="text-sm">{account.health_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {account.metrics.permission_count === account.metrics.expected_permissions ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {account.metrics.permission_count}/{account.metrics.expected_permissions}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {account.metrics.has_business_settings ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/20">
                            Biz
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-500/20">
                            Biz
                          </Badge>
                        )}
                        {account.metrics.has_account_settings ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/20">
                            Acc
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-500/20">
                            Acc
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.metrics.subscription_status ? (
                        <Badge
                          variant="outline"
                          className={
                            account.metrics.subscription_status === 'active'
                              ? 'text-emerald-600 border-emerald-500/20'
                              : account.metrics.subscription_status === 'trialing'
                              ? 'text-blue-600 border-blue-500/20'
                              : 'text-amber-600 border-amber-500/20'
                          }
                        >
                          {account.metrics.subscription_status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(account.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        {expandedRow === account.user_id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === account.user_id && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/30 p-0">
                        <AccountHealthDetails account={account} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
