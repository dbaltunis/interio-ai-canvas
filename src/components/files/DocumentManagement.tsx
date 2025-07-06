
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Image, Download, Eye, Search, Filter, Calendar, User } from "lucide-react";
import { useProjectFiles } from "@/hooks/useFileStorage";

interface DocumentManagementProps {
  projectId?: string;
}

export const DocumentManagement = ({ projectId }: DocumentManagementProps) => {
  const { data: files, isLoading } = useProjectFiles(projectId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  const getFileTypeLabel = (bucketName: string) => {
    return bucketName === 'project-images' ? 'Image' : 'Document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files?.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
      (filterType === 'images' && file.bucket_name === 'project-images') ||
      (filterType === 'documents' && file.bucket_name === 'project-documents');
    return matchesSearch && matchesType;
  }) || [];

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.file_name.localeCompare(b.file_name);
      case 'size':
        return (b.file_size || 0) - (a.file_size || 0);
      case 'type':
        return a.file_type.localeCompare(b.file_type);
      default: // date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredFiles.length} files
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Files Table */}
          {sortedFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No files found matching your criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      {getFileIcon(file.file_type)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{file.file_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFileTypeLabel(file.bucket_name)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {file.file_size ? formatFileSize(file.file_size) : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
