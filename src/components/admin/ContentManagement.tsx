import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getContentManagementLogs, ContentManagementLog } from "@/services/contentManagementService";
import { Course } from "@/services/courseManagementService";
import CourseListView from "./content/CourseListView";
import CourseForm from "./content/CourseForm";
import { Edit, Trash, Plus, File, FolderClosed, Book, Eye, EyeOff, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LogsTableProps {
  logs: ContentManagementLog[];
  isLoading: boolean;
}

const LogsTable: React.FC<LogsTableProps> = ({ logs, isLoading }) => {
  const getOperationBadge = (operation: string) => {
    switch (operation) {
      case 'create':
        return <Badge className="bg-green-500">Create</Badge>;
      case 'update':
        return <Badge className="bg-blue-500">Update</Badge>;
      case 'delete':
        return <Badge className="bg-red-500">Delete</Badge>;
      case 'publish':
        return <Badge className="bg-purple-500">Publish</Badge>;
      case 'unpublish':
        return <Badge className="bg-gray-500">Unpublish</Badge>;
      default:
        return <Badge>{operation}</Badge>;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'course':
        return <FolderClosed className="h-4 w-4" />;
      case 'module':
        return <File className="h-4 w-4" />;
      case 'lesson':
        return <Book className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Recent content management operations</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead>Resource</TableHead>
          <TableHead>Resource ID</TableHead>
          <TableHead>Admin</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
              No content management logs found
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getOperationBadge(log.operation_type)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getResourceIcon(log.resource_type)}
                  <span className="capitalize">{log.resource_type}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{log.resource_id.substring(0, 8)}...</TableCell>
              <TableCell>{log.admin_id.substring(0, 8)}...</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const ContentManagement: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Create New Course");
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['contentManagementLogs'],
    queryFn: () => getContentManagementLogs(100),
  });

  const handleCreateCourse = () => {
    setSelectedCourse(undefined);
    setDialogTitle("Create New Course");
    setDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setDialogTitle(`Edit Course: ${course.title}`);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content Management</CardTitle>
        <CardDescription>
          Create, update, and manage course content across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="mt-4">
            <CourseListView 
              onCreateCourse={handleCreateCourse}
              onEditCourse={handleEditCourse}
            />
          </TabsContent>
          
          <TabsContent value="modules" className="mt-4">
            <div className="text-sm text-gray-500 py-8 text-center">
              Module management interface to be implemented
            </div>
          </TabsContent>
          
          <TabsContent value="lessons" className="mt-4">
            <div className="text-sm text-gray-500 py-8 text-center">
              Lesson management interface to be implemented
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <LogsTable logs={logs} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
        
        {/* Course Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <CourseForm 
              course={selectedCourse}
              onSuccess={handleDialogClose}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContentManagement;
