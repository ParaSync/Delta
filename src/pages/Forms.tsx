import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy,
  MoreVertical,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useNavigate } from 'react-router-dom';

const mockForms = [
  { 
    id: 1, 
    name: 'Employee Onboarding Form', 
    description: 'Comprehensive onboarding process for new hires',
    responses: 45, 
    lastEdited: '2 hours ago', 
    status: 'active',
    createdBy: 'Admin User'
  },
  { 
    id: 2, 
    name: 'Equipment Request Form', 
    description: 'Request new equipment or report issues',
    responses: 23, 
    lastEdited: '1 day ago', 
    status: 'active',
    createdBy: 'HR Manager'
  },
  { 
    id: 3, 
    name: 'Time Off Request', 
    description: 'Submit vacation and leave requests',
    responses: 67, 
    lastEdited: '3 days ago', 
    status: 'active',
    createdBy: 'Admin User'
  },
  { 
    id: 4, 
    name: 'Performance Review', 
    description: 'Annual performance evaluation form',
    responses: 12, 
    lastEdited: '1 week ago', 
    status: 'draft',
    createdBy: 'Manager'
  },
  { 
    id: 5, 
    name: 'Customer Feedback Survey', 
    description: 'Collect feedback from customers',
    responses: 156, 
    lastEdited: '2 weeks ago', 
    status: 'archived',
    createdBy: 'Marketing Team'
  },
];

export default function Forms() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredForms = mockForms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  if (user?.role === 'employee') {
    return <EmployeeFormsView forms={filteredForms} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Forms</h1>
          <p className="text-muted-foreground">Create and manage your data collection forms</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/forms/new')}>
          <Plus className="h-4 w-4" />
          Create New Form
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search forms..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {form.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {form.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{form.responses} responses</span>
                <Badge variant={getStatusColor(form.status)}>
                  {form.status}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Created by {form.createdBy}</p>
                <p>Last edited {form.lastEdited}</p>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  Edit Form
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No forms found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first form'}
                </p>
              </div>
              {!searchTerm && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmployeeFormsView({ forms }: { forms: typeof mockForms }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Forms</h1>
        <p className="text-muted-foreground">Forms you can complete</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.filter(form => form.status === 'active').map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">
                {form.name}
              </CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>{form.responses} people have completed this form</p>
              </div>
              
              <Button className="w-full">
                Start Form
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}