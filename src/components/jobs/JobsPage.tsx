
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, Plus, MoreVertical, Copy, Trash2, Users, Calendar, FileText, List } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";

export const JobsPage = () => {
  const { data: projects, isLoading } = useProjects();
  const { data: clients } = useClients();
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchClient, setSearchClient] = useState("");
  const [searchJobNumber, setSearchJobNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDeposit, setFilterDeposit] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterMaker, setFilterMaker] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getClientPhone = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.phone || '-';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      quote: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      order: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      invoice: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      completed: "bg-green-100 text-green-800 hover:bg-green-200",
    };

    return (
      <Badge className={statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const generateJobNumber = (index: number) => {
    return `QUOTE-${String(1000 + index).padStart(4, '0')}`;
  };

  const filteredProjects = projects?.filter(project => {
    if (searchClient && !getClientName(project.client_id).toLowerCase().includes(searchClient.toLowerCase())) {
      return false;
    }
    if (searchJobNumber && !generateJobNumber(0).includes(searchJobNumber)) {
      return false;
    }
    if (filterStatus && project.status !== filterStatus) {
      return false;
    }
    return true;
  }) || [];

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={activeTab === "jobs" ? "default" : "outline"}
            onClick={() => setActiveTab("jobs")}
            className="px-6"
          >
            Jobs ({projects?.length || 0})
          </Button>
          <Button
            variant={activeTab === "client" ? "default" : "outline"} 
            onClick={() => setActiveTab("client")}
            className="px-6"
          >
            Client ({clients?.length || 0})
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button className="bg-slate-600 hover:bg-slate-700 text-white">
            New Job
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Panel */}
      {showFilters && (
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
                <SelectItem value="">All Statuses</SelectItem>
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
                <SelectItem value="">All Deposits</SelectItem>
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
                <SelectItem value="">All Owners</SelectItem>
                <SelectItem value="admin">InterioApp Admin</SelectItem>
                <SelectItem value="chris">Chris Ogden</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMaker} onValueChange={setFilterMaker}>
              <SelectTrigger>
                <SelectValue placeholder="Search by Curtain maker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Makers</SelectItem>
                <SelectItem value="maker1">Maker 1</SelectItem>
                <SelectItem value="maker2">Maker 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => {
              setSearchClient("");
              setSearchJobNumber("");
              setFilterStatus("");
              setFilterDeposit("");
              setFilterOwner("");
              setFilterMaker("");
            }}>
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Quote Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Calendar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Team</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {generateJobNumber(index)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(project.total_amount || 0)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(project.total_amount || 0)}
                  </TableCell>
                  <TableCell>{getClientName(project.client_id)}</TableCell>
                  <TableCell>{getClientPhone(project.client_id)}</TableCell>
                  <TableCell>
                    {project.due_date ? new Date(project.due_date).toLocaleDateString('en-GB') : '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status === 'planning' ? 'quote' : project.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">IA</span>
                      </div>
                      <span className="text-sm">InterioApp Admin</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Invite team members
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Client details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <List className="h-4 w-4 mr-2" />
                          Progress <Badge variant="secondary" className="ml-1 text-xs">Beta</Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Note
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  No jobs found. Create your first job to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
