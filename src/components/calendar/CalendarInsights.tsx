import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageSquare
} from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

export const CalendarInsights = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const { data: appointments } = useAppointments();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();

  const todayAppointments = appointments?.filter(apt => 
    isToday(new Date(apt.start_time))
  ) || [];

  const tomorrowAppointments = appointments?.filter(apt => 
    isTomorrow(new Date(apt.start_time))
  ) || [];

  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.start_time);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return aptDate >= today && aptDate <= nextWeek;
  }) || [];

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'No client assigned';
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Unknown client';
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'No project assigned';
    const project = projects?.find(p => p.id === projectId);
    return project?.name || 'Unknown project';
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-500';
      case 'measurement': return 'bg-green-500';
      case 'installation': return 'bg-purple-500';
      case 'follow-up': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getAppointmentTypeColor(appointment.appointment_type)}`} />
              <h3 className="font-medium">{appointment.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {appointment.appointment_type}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(appointment.start_time), 'HH:mm')} - 
                  {format(new Date(appointment.end_time), 'HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{getClientName(appointment.client_id)}</span>
              </div>
              
              {appointment.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>{getProjectName(appointment.project_id)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {appointment.description && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            {appointment.description}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendar Insights</h2>
          <p className="text-gray-600">Upcoming appointments and schedule overview</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{todayAppointments.length}</div>
            <div className="text-sm text-gray-600">Today's Appointments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{tomorrowAppointments.length}</div>
            <div className="text-sm text-gray-600">Tomorrow's Appointments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{upcomingAppointments.length}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-gray-600">Pending Confirmations</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow ({tomorrowAppointments.length})</TabsTrigger>
          <TabsTrigger value="week">This Week ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts (2)</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                <p className="text-gray-600">Enjoy your free day or schedule some follow-ups!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tomorrow" className="space-y-4">
          {tomorrowAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments tomorrow</h3>
                <p className="text-gray-600">Perfect time to prepare for the week ahead!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tomorrowAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900">Confirmation Required</h4>
                    <p className="text-sm text-yellow-700">
                      2 appointments need client confirmation for next week
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Follow-up Reminder</h4>
                    <p className="text-sm text-blue-700">
                      3 clients are due for project follow-ups
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Consultation</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Book Measurement</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Star className="h-6 w-6" />
              <span className="text-sm">Schedule Install</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Follow-up Call</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};