import React, { useState } from 'react';
import { Search, Calendar, Users, AlertTriangle, Bell, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const ServiceCampaigns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data
  const serviceCampaigns = [
    {
      id: '1',
      campaignNumber: 'RC-2024-001',
      title: 'Battery Cooling System Inspection',
      description: 'Inspect battery cooling system for potential leaks in affected vehicles',
      type: 'recall',
      severity: 'high',
      affectedVehicles: 1247,
      completedServices: 892,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      status: 'active'
    },
    {
      id: '2',
      campaignNumber: 'SB-2024-002',
      title: 'Infotainment Software Update',
      description: 'Critical security update for infotainment system',
      type: 'software-update',
      severity: 'medium',
      affectedVehicles: 3456,
      completedServices: 2134,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      status: 'active'
    },
    {
      id: '3',
      campaignNumber: 'IN-2024-003',
      title: 'Charging Port Safety Check',
      description: 'Routine inspection of charging port connections',
      type: 'inspection',
      severity: 'low',
      affectedVehicles: 567,
      completedServices: 123,
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      status: 'active'
    }
  ];

  const affectedVehicles = [
    {
      id: '1',
      vin: '1HGBH41JXMN109186',
      vehicleInfo: '2023 Tesla Model 3',
      customerName: 'John Smith',
      customerPhone: '+1-555-0123',
      customerEmail: 'john.smith@email.com',
      notificationSent: true,
      appointmentScheduled: true,
      serviceCompleted: false,
      scheduledDate: '2024-02-15'
    },
    {
      id: '2',
      vin: '5YJ3E1EA9KF123456',
      vehicleInfo: '2022 BMW iX',
      customerName: 'Sarah Johnson',
      customerPhone: '+1-555-0456',
      customerEmail: 'sarah.j@email.com',
      notificationSent: true,
      appointmentScheduled: false,
      serviceCompleted: false
    },
    {
      id: '3',
      vin: 'WAUZZZF15HA123789',
      vehicleInfo: '2021 Audi e-tron',
      customerName: 'Mike Davis',
      customerPhone: '+1-555-0789',
      customerEmail: 'mike.davis@email.com',
      notificationSent: false,
      appointmentScheduled: false,
      serviceCompleted: false
    }
  ];

  const appointments = [
    {
      id: '1',
      date: '2024-02-15',
      time: '09:00',
      customerName: 'John Smith',
      vehicleInfo: '2023 Tesla Model 3',
      campaignTitle: 'Battery Cooling System Inspection',
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2024-02-15',
      time: '14:00',
      customerName: 'Emily Brown',
      vehicleInfo: '2023 Nissan Leaf',
      campaignTitle: 'Charging Port Safety Check',
      status: 'scheduled'
    },
    {
      id: '3',
      date: '2024-02-16',
      time: '10:30',
      customerName: 'David Wilson',
      vehicleInfo: '2022 Ford Mustang Mach-E',
      campaignTitle: 'Infotainment Software Update',
      status: 'scheduled'
    }
  ];

  const filteredCampaigns = serviceCampaigns.filter(campaign =>
    campaign.campaignNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'recall': return AlertTriangle;
      case 'service-bulletin': return Bell;
      case 'software-update': return Users;
      case 'inspection': return CheckCircle;
      default: return Users;
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[severity] || 'outline';
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getCompletionPercentage = (campaign) => {
    return Math.round((campaign.completedServices / campaign.affectedVehicles) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Recall & Service Campaigns</h1>
        <p className="text-muted-foreground">Manage recalls, service bulletins, and customer notifications</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceCampaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Affected Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceCampaigns.reduce((sum, c) => sum + c.affectedVehicles, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completed Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceCampaigns.reduce((sum, c) => sum + c.completedServices, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Services done</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns by number, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Service Campaigns</CardTitle>
            <CardDescription>
              {filteredCampaigns.length} campaigns found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const TypeIcon = getTypeIcon(campaign.type);
                  const completion = getCompletionPercentage(campaign);
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-sm text-muted-foreground">{campaign.campaignNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-4 h-4" />
                          <span className="text-sm">{campaign.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{completion}%</div>
                          <div className="text-xs text-muted-foreground">
                            {campaign.completedServices}/{campaign.affectedVehicles}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadge(campaign.severity)}>
                          {campaign.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Appointment Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Calendar</CardTitle>
            <CardDescription>Schedule and manage service appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div className="mt-4">
              <h4 className="font-medium mb-2">Today's Appointments</h4>
              <div className="space-y-2">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <p className="text-sm font-medium">{appointment.time} - {appointment.customerName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.vehicleInfo}</p>
                    </div>
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>{selectedCampaign.campaignNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vehicles">Affected Vehicles</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Campaign Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Title:</span> {selectedCampaign.title}</div>
                      <div><span className="font-medium">Description:</span> {selectedCampaign.description}</div>
                      <div><span className="font-medium">Type:</span> {selectedCampaign.type}</div>
                      <div><span className="font-medium">Severity:</span>
                        <Badge variant={getSeverityBadge(selectedCampaign.severity)} className="ml-2">
                          {selectedCampaign.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Progress</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Affected Vehicles:</span> {selectedCampaign.affectedVehicles}</div>
                      <div><span className="font-medium">Completed Services:</span> {selectedCampaign.completedServices}</div>
                      <div><span className="font-medium">Completion Rate:</span> {getCompletionPercentage(selectedCampaign)}%</div>
                      <div><span className="font-medium">Start Date:</span> {selectedCampaign.startDate}</div>
                      <div><span className="font-medium">End Date:</span> {selectedCampaign.endDate}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Vehicles Tab */}
              <TabsContent value="vehicles">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Notification</TableHead>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affectedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.vehicleInfo}</p>
                            <p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.customerName}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={vehicle.notificationSent ? 'default' : 'outline'}>
                            {vehicle.notificationSent ? 'Sent' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={vehicle.appointmentScheduled ? 'default' : 'outline'}>
                            {vehicle.appointmentScheduled ? 'Scheduled' : 'Not Scheduled'}
                          </Badge>
                          {vehicle.scheduledDate && (
                            <p className="text-xs text-muted-foreground mt-1">{vehicle.scheduledDate}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={vehicle.serviceCompleted ? 'default' : 'outline'}>
                            {vehicle.serviceCompleted ? 'Completed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Contact
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Notification Status</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {affectedVehicles.filter(v => v.notificationSent).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Notifications Sent</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {affectedVehicles.filter(v => v.appointmentScheduled).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Appointments Scheduled</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {affectedVehicles.filter(v => !v.notificationSent).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Pending Notifications</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex space-x-2">
                    <Button>Send Notifications</Button>
                    <Button variant="outline">Export Customer List</Button>
                    <Button variant="outline">Generate Report</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceCampaigns;
