import { useAccountHealth } from '@/hooks/useAccountHealth';
import { HealthOverviewCards } from '@/components/admin/health/HealthOverviewCards';
import { AccountHealthTable } from '@/components/admin/health/AccountHealthTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAccountHealth() {
  const { data: summary, isLoading, refetch, isFetching } = useAccountHealth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Account Health Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor account configuration and identify issues
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="mb-6">
          <HealthOverviewCards summary={summary} isLoading={isLoading} />
        </div>

        {/* Health Table */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <AccountHealthTable accounts={summary?.accounts || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
