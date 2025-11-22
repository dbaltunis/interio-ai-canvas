import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutList, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import { TasksList } from "@/components/tasks/TasksList";
import { TasksBoard } from "@/components/tasks/TasksBoard";
import { TasksCalendar } from "@/components/tasks/TasksCalendar";
import { QuickAddTask } from "@/components/tasks/QuickAddTask";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";

export default function Tasks() {
  const [view, setView] = useState<"list" | "board" | "calendar">("list");

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveHeader activeTab="tasks" onTabChange={() => {}} />
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your daily tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="h-8 w-8 p-0"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "board" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("board")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}
                className="h-8 w-8 p-0"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
            <QuickAddTask
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              }
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 mt-0">
            {view === "list" && <TasksList filter="all" />}
            {view === "board" && <TasksBoard filter="all" />}
            {view === "calendar" && <TasksCalendar />}
          </TabsContent>

          <TabsContent value="today" className="flex-1 mt-0">
            {view === "list" && <TasksList filter="today" />}
            {view === "board" && <TasksBoard filter="today" />}
            {view === "calendar" && <TasksCalendar highlightToday />}
          </TabsContent>

          <TabsContent value="week" className="flex-1 mt-0">
            {view === "list" && <TasksList filter="week" />}
            {view === "board" && <TasksBoard filter="week" />}
            {view === "calendar" && <TasksCalendar />}
          </TabsContent>

          <TabsContent value="overdue" className="flex-1 mt-0">
            {view === "list" && <TasksList filter="overdue" />}
            {view === "board" && <TasksBoard filter="overdue" />}
            {view === "calendar" && <TasksCalendar highlightOverdue />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </div>
  );
}
