
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { User, Clock, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  currentWorkload: number;
  maxCapacity: number;
  status: 'available' | 'busy' | 'offline';
}

interface TaskAssignment {
  id: string;
  workOrderId: string;
  treatmentType: string;
  projectName: string;
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  status: 'assigned' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  skills_required: string[];
  notes?: string;
}

interface TaskDelegationBoardProps {
  teamMembers: TeamMember[];
  taskAssignments: TaskAssignment[];
  onReassignTask: (taskId: string, newAssignee: string) => void;
  onUpdateTaskStatus: (taskId: string, status: string) => void;
}

export const TaskDelegationBoard = ({
  teamMembers,
  taskAssignments,
  onReassignTask,
  onUpdateTaskStatus
}: TaskDelegationBoardProps) => {
  const [selectedMember, setSelectedMember] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getWorkloadPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const filteredTasks = selectedMember === "all" 
    ? taskAssignments 
    : taskAssignments.filter(task => task.assignedTo === selectedMember);

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const memberTasks = taskAssignments.filter(t => t.assignedTo === member.name);
              const workloadPercentage = getWorkloadPercentage(member.currentWorkload, member.maxCapacity);
              
              return (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getMemberStatusColor(member.status)}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload</span>
                      <span>{member.currentWorkload}h / {member.maxCapacity}h</span>
                    </div>
                    <Progress value={workloadPercentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Active Tasks</span>
                      <span>{memberTasks.filter(t => ['assigned', 'in-progress'].includes(t.status)).length}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.expertise.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.expertise.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filter by Team Member:</label>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task Assignments */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => {
          const assignedMember = teamMembers.find(m => m.name === task.assignedTo);
          const isOverdue = new Date(task.dueDate) < new Date();
          
          return (
            <Card key={task.id} className={`relative ${isOverdue && task.status !== 'completed' ? 'border-red-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                  {isOverdue && task.status !== 'completed' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-base">{task.treatmentType}</CardTitle>
                <p className="text-sm text-muted-foreground">{task.projectName}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Assigned Member */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <Select 
                    value={task.assignedTo} 
                    onValueChange={(value) => onReassignTask(task.id, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.name}>
                          <div className="flex items-center space-x-2">
                            <span>{member.name}</span>
                            <div className={`w-2 h-2 rounded-full ${getMemberStatusColor(member.status)}`} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Tracking */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Progress</span>
                    <span>{task.actualHours}h / {task.estimatedHours}h</span>
                  </div>
                  <Progress 
                    value={Math.min((task.actualHours / task.estimatedHours) * 100, 100)}
                    className="h-2"
                  />
                </div>

                {/* Due Date */}
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className={isOverdue && task.status !== 'completed' ? 'text-red-600' : ''}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Required Skills */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-600">Required Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {task.skills_required.map((skill) => {
                      const hasSkill = assignedMember?.expertise.includes(skill);
                      return (
                        <Badge 
                          key={skill} 
                          variant={hasSkill ? "default" : "secondary"}
                          className={`text-xs ${!hasSkill ? 'bg-yellow-100 text-yellow-800' : ''}`}
                        >
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Status Update */}
                <Select 
                  value={task.status} 
                  onValueChange={(value) => onUpdateTaskStatus(task.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {task.notes && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {task.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
