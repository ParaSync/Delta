import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Download, Eye, Edit3, Trash2, Calendar, FileText, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';

const mockResponses = [
  {
    id: 1,
    formName: 'Employee Onboarding Form',
    submittedBy: 'John Smith',
    submittedAt: '2024-01-15 14:30',
    status: 'completed',
    responseId: 'R001',
  },
  {
    id: 2,
    formName: 'Equipment Request Form',
    submittedBy: 'Sarah Johnson',
    submittedAt: '2024-01-15 10:15',
    status: 'completed',
    responseId: 'R002',
  },
  {
    id: 3,
    formName: 'Time Off Request',
    submittedBy: 'Mike Wilson',
    submittedAt: '2024-01-14 16:45',
    status: 'pending',
    responseId: 'R003',
  },
  {
    id: 4,
    formName: 'Performance Review',
    submittedBy: 'Emily Davis',
    submittedAt: '2024-01-14 09:20',
    status: 'completed',
    responseId: 'R004',
  },
];

export default function Responses() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResponses = mockResponses.filter(
    (response) =>
      response.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.responseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === 'admin' ? 'All Responses' : 'My Responses'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin'
              ? 'View and manage all form responses'
              : 'Track your form submissions and responses'}
          </p>
        </div>

        {user?.role === 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockResponses.length}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground">+25% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge className="h-4 w-4 p-0 bg-transparent">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockResponses.filter((r) => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Badge className="h-4 w-4 p-0 bg-transparent">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {mockResponses.filter((r) => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Form Responses</CardTitle>
          <CardDescription>
            {filteredResponses.length} response{filteredResponses.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredResponses.map((response, index) => (
              <div
                key={response.id}
                className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                  index !== filteredResponses.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{response.formName}</h4>
                    <Badge variant={getStatusColor(response.status)}>{response.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Response ID: {response.responseId}</span>
                    <span>•</span>
                    <span>Submitted by {response.submittedBy}</span>
                    <span>•</span>
                    <span>{response.submittedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>

                  {user?.role === 'admin' && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredResponses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No responses found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'No form responses have been submitted yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
