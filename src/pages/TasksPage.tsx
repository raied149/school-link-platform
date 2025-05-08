
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { DateSidebar } from "@/components/tasks/DateSidebar";
import { TaskTabContent } from "@/components/tasks/TaskTabContent";
import { useTaskManagement } from "@/hooks/useTaskManagement";

export default function TasksPage() {
  const { user } = useAuth();
  
  const {
    tasks,
    isLoading,
    isFormOpen,
    selectedTask,
    filterStatus,
    filterType,
    searchQuery,
    currentTab,
    selectedDate,
    isCalendarOpen,
    setFilterStatus,
    setFilterType,
    setSearchQuery,
    setCurrentTab,
    setSelectedDate,
    setIsCalendarOpen,
    handleDeleteTask,
    handleEditTask,
    handleStatusChange,
    handleAddTask,
    handleFormClose,
    handleDateSelect
  } = useTaskManagement({ userId: user?.id, userRole: user?.role });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <div className="flex gap-2">
          {user && (
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="p-4 md:col-span-4">
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="mb-2 h-9">
                <TabsTrigger value="all">All</TabsTrigger>
                {user?.role !== 'student' && <TabsTrigger value="assigned">Assigned By Me</TabsTrigger>}
                <TabsTrigger value="received">Assigned To Me</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="by_date">By Date</TabsTrigger>
              </TabsList>
            </div>
            
            <TaskTabContent
              tasks={tasks}
              isLoading={isLoading}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onStatusChange={handleStatusChange}
              currentUserId={user?.id}
              currentTab={currentTab}
              selectedDate={selectedDate}
              setIsCalendarOpen={setIsCalendarOpen}
              isCalendarOpen={isCalendarOpen}
              handleDateSelect={handleDateSelect}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </Tabs>
        </Card>
        
        <DateSidebar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          tasks={tasks}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          onStatusChange={handleStatusChange}
          currentUserId={user?.id}
          isLoading={isLoading}
        />
      </div>
      
      <TaskFormDialog 
        open={isFormOpen} 
        onOpenChange={handleFormClose} 
        task={selectedTask}
      />
    </div>
  );
}
