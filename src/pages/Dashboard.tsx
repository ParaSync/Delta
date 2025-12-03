import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  MessageSquareMore,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getAuth } from 'firebase/auth';
import { route } from '@/firebase/client';
import { Form } from '@/types/formBuilder';
import { toast } from '@/hooks/use-toast';

// Mock data for MVP
const mockStats = {
  admin: {
    totalForms: 12,
    totalResponses: 348,
    totalUsers: 25,
    activeToday: 8,
  },
  employee: {
    availableForms: 6,
    completedForms: 23,
    pendingForms: 3,
    thisMonth: 12,
  },
};

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.admin.totalForms}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquareMore className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.admin.totalResponses}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.admin.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+3 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.admin.activeToday}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Forms */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Forms</CardTitle>
              <CardDescription>Manage your data collection forms</CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* <div className="space-y-4">
            {mockForms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{form.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{form.responses} responses</span>
                    <span>•</span>
                    <span>Last edited {form.lastEdited}</span>
                    <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
                      {form.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

type FormDashboard = Form & {
  responses: number;
};

function EmployeeDashboard() {
  const [forms, setForms] = useState<FormDashboard[]>([]);
  const [countAnswered, setAnswered] = useState<number>(0);
  const { user } = useAuth();

  const fetchPublishedForms = async () => {
    const response = await fetch(route('/api/form/list/published/' + user.supaId), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok) {
      setForms(data.value);
      console.log('Successful:', response.status, forms);
    } else {
      console.error('Error:', response.status, data);
      toast({
        title: 'Error fetching forms.',
        description: 'Your forms are unavailable right now.',
      });
    }
  };

  const fetchAnsweredForms = async () => {
    const response = await fetch(route('/api/form/answered/' + user.supaId), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok) {
      setAnswered(data.value);
      console.log('Successful:', response.status, countAnswered);
    } else {
      console.error('Error:', response.status, data);
      toast({
        title: 'Error fetching count of submitted forms.',
        description: 'Your submissions are unavailable right now.',
      });
    }
  };

  useEffect(() => {
    fetchPublishedForms();
    fetchAnsweredForms();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{forms.length}</div>
            <p className="text-xs text-muted-foreground">Published forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <MessageSquareMore className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{countAnswered}</div>
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{mockStats.employee.pendingForms}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mockStats.employee.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Forms completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Available Forms</CardTitle>
          <CardDescription>Forms you published</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.slice(0, 3).map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{form.title}</CardTitle>
                  <CardDescription>{form.responses} people completed this</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full">Edit Form</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
