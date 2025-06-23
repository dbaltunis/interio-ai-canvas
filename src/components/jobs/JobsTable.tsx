
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Users, Calendar, FileText, List, MoreVertical } from "lucide-react";

interface JobsTableProps {
  projects: any[];
  clients: any[];
}

export const JobsTable = ({ projects, clients }: JobsTableProps) => {
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

  return (
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
          {projects.length > 0 ? (
            projects.map((project, index) => (
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
  );
};
