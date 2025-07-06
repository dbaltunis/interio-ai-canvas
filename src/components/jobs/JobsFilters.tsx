
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X } from "lucide-react";

interface JobsFiltersProps {
  searchClient: string;
  setSearchClient: (value: string) => void;
  searchJobNumber: string;
  setSearchJobNumber: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDeposit: string;
  setFilterDeposit: (value: string) => void;
  filterOwner: string;
  setFilterOwner: (value: string) => void;
  filterMaker: string;
  setFilterMaker: (value: string) => void;
  onClearAll: () => void;
}

export const JobsFilters = ({
  searchClient,
  setSearchClient,
  searchJobNumber,
  setSearchJobNumber,
  filterStatus,
  setFilterStatus,
  filterDeposit,
  setFilterDeposit,
  filterOwner,
  setFilterOwner,
  filterMaker,
  setFilterMaker,
  onClearAll
}: JobsFiltersProps) => {
  const [filterOpen, setFilterOpen] = useState(false);

  // Calculate active filters
  const activeFiltersCount = 
    (filterStatus !== 'all' ? 1 : 0) +
    (filterDeposit !== 'all' ? 1 : 0) +
    (filterOwner !== 'all' ? 1 : 0) +
    (filterMaker !== 'all' ? 1 : 0);

  const hasActiveFilters = searchClient || searchJobNumber || activeFiltersCount > 0;

  const clearFilters = () => {
    onClearAll();
  };

  const clearIndividualFilter = (filterType: string) => {
    switch (filterType) {
      case 'status':
        setFilterStatus('all');
        break;
      case 'deposit':
        setFilterDeposit('all');
        break;
      case 'owner':
        setFilterOwner('all');
        break;
      case 'maker':
        setFilterMaker('all');
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for client's name"
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by Job Number"
            value={searchJobNumber}
            onChange={(e) => setSearchJobNumber(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5 ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Jobs</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Deposit Status</label>
                  <Select value={filterDeposit} onValueChange={setFilterDeposit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Deposits</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Project Owner</label>
                  <Select value={filterOwner} onValueChange={setFilterOwner}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Owners</SelectItem>
                      <SelectItem value="admin">InterioApp Admin</SelectItem>
                      <SelectItem value="chris">Chris Ogden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Curtain Maker</label>
                  <Select value={filterMaker} onValueChange={setFilterMaker}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Makers</SelectItem>
                      <SelectItem value="maker1">Maker 1</SelectItem>
                      <SelectItem value="maker2">Maker 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Info */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {(searchClient || searchJobNumber) && (
            <span>
              {searchClient && `Client: "${searchClient}"`}
              {searchClient && searchJobNumber && " • "}
              {searchJobNumber && `Job: "${searchJobNumber}"`}
              {activeFiltersCount > 0 && " • "}
            </span>
          )}
          {activeFiltersCount > 0 && (
            <span>{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied</span>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filterStatus}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearIndividualFilter('status')}
              />
            </Badge>
          )}
          {filterDeposit !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Deposit: {filterDeposit}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearIndividualFilter('deposit')}
              />
            </Badge>
          )}
          {filterOwner !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Owner: {filterOwner === 'admin' ? 'InterioApp Admin' : 'Chris Ogden'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearIndividualFilter('owner')}
              />
            </Badge>
          )}
          {filterMaker !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Maker: {filterMaker === 'maker1' ? 'Maker 1' : 'Maker 2'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearIndividualFilter('maker')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
