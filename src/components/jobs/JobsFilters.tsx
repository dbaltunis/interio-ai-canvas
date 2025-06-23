
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          placeholder="Search for client's name"
          value={searchClient}
          onChange={(e) => setSearchClient(e.target.value)}
        />
        <Input
          placeholder="Search by Job Number"
          value={searchJobNumber}
          onChange={(e) => setSearchJobNumber(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Search by Job Status" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select value={filterDeposit} onValueChange={setFilterDeposit}>
          <SelectTrigger>
            <SelectValue placeholder="Search by Deposit Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Deposits</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger>
            <SelectValue placeholder="Search by Project Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            <SelectItem value="admin">InterioApp Admin</SelectItem>
            <SelectItem value="chris">Chris Ogden</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMaker} onValueChange={setFilterMaker}>
          <SelectTrigger>
            <SelectValue placeholder="Search by Curtain maker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Makers</SelectItem>
            <SelectItem value="maker1">Maker 1</SelectItem>
            <SelectItem value="maker2">Maker 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onClearAll}>
          Clear all
        </Button>
      </div>
    </div>
  );
};
