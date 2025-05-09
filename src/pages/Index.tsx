
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-blue-900">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8 flex flex-col items-center">
          <img 
            src="/lovable-uploads/9811b7b8-6807-4171-b356-47e999d902e9.png" 
            alt="SlateEd Logo" 
            className="h-28 w-auto mb-4" 
          />
          <h1 className="text-4xl font-bold mb-2">SlateEd</h1>
          <p className="text-muted-foreground text-lg mb-6">
            The complete school management platform
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/login')} size="lg">
              Login
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track student information, attendance, and academic progress.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage teachers, staff information and attendance records.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Academic Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Handle classes, exams, grading and scheduling in one place.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
