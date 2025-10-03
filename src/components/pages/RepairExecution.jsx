import React, { useState } from 'react';
import { Search, Clock, User, Package, CheckCircle, Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const RepairExecution = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  // Mock data
  const repairJobs = [
    {
      id: '1',
      jobNumber: 'RJ-2024-001',
      claimNumber: 'WC-2024-001',
      vin: '1HGBH41JXMN109186',
      vehicleInfo: '2023 Tesla Model 3',
      customerName: 'John Smith',
      problemDescription: 'Battery charging issues - vehicle not accepting charge above 80%',
      assignedTechnician: 'Mike Tech',
      estimatedHours: 8,
      actualHours: 6.5,
      status: 'in-progress',
      progress: 75,
      startDate: '2024-01-16',
      expectedCompletion: '2024-01-18',
      parts: [
        {
          id: '1',
          partName: 'Battery Management Module',
          partNumber: 'BMM-2023-001',
          quantity: 1,
          status: 'delivered',
          expectedDelivery: '2024-01-17',
          supplier: 'Tesla Parts'
        },
        {
          id: '2',
          partName: 'Wiring Harness',
          partNumber: 'WH-2023-002',
          quantity: 1,
          status: 'installed',
          expectedDelivery: '2024-01-16',
          supplier: 'Tesla Parts'
        }
      ],
      steps: [
        {
          id: '1',
          stepNumber: 1,
          description: 'Diagnostic battery system',
          estimatedTime: 2,
          actualTime: 1.5,
          status: 'completed',
          technician: 'Mike Tech'
        },
        {
          id: '2',
          stepNumber: 2,
          description: 'Remove battery pack',
          estimatedTime: 3,
          actualTime: 2.5,
          status: 'completed',
          technician: 'Mike Tech'
        },
        {
          id: '3',
          stepNumber: 3,
          description: 'Replace battery management module',
          estimatedTime: 2,
          actualTime: 2,
          status: 'completed',
          technician: 'Mike Tech'
        },
        {
          id: '4',
          stepNumber: 4,
          description: 'Reinstall battery pack',
          estimatedTime: 1,
          status: 'in-progress',
          technician: 'Mike Tech'
        }
      ]
    },
    {
      id: '2',
      jobNumber: 'RJ-2024-002',
      claimNumber: 'WC-2024-002',
      vin: '5YJ3E1EA9KF123456',
      vehicleInfo: '2022 BMW iX',
      customerName: 'Sarah Johnson',
      problemDescription: 'Motor making unusual noise during acceleration',
      assignedTechnician: 'Sarah Wilson',
      estimatedHours: 12,
      actualHours: 0,
      status: 'waiting-parts',
      progress: 10,
      startDate: '2024-01-22',
      expectedCompletion: '2024-01-26',
      parts: [
        {
          id: '3',
          partName: 'Front Motor Assembly',
          partNumber: 'FMA-2022-001',
          quantity: 1,
          status: 'in-transit',
          expectedDelivery: '2024-01-24',
          supplier: 'BMW Parts'
        }
      ],
      steps: [
        {
          id: '5',
          stepNumber: 1,
          description: 'Diagnostic motor system',
          estimatedTime: 1,
          actualTime: 1,
          status: 'completed',
          technician: 'Sarah Wilson'
        },
        {
          id: '6',
          stepNumber: 2,
          description: 'Remove motor assembly',
          estimatedTime: 4,
          status: 'pending',
          technician: 'Sarah Wilson'
        },
        {
          id: '7',
          stepNumber: 3,
          description: 'Install new motor assembly',
          estimatedTime: 4,
          status: 'pending'
        },
        {
          id: '8',
          stepNumber: 4,
          description: 'Test and calibrate',
          estimatedTime: 3,
          status: 'pending'
        }
      ]
    },
    {
      id: '3',
      jobNumber: 'RJ-2024-003',
      claimNumber: 'WC-2024-003',
      vin: 'WAUZZZF15HA123789',
      vehicleInfo: '2021 Audi e-tron',
      customerName: 'Mike Davis',
      problemDescription: 'Infotainment system randomly rebooting',
      assignedTechnician: 'John Tech',
      estimatedHours: 4,
      actualHours: 4,
      status: 'completed',
      progress: 100,
      startDate: '2024-01-26',
      expectedCompletion: '2024-01-26',
      parts: [],
      steps: [
        {
          id: '9',
          stepNumber: 1,
          description: 'Diagnostic software issues',
          estimatedTime: 1,
          actualTime: 1,
          status: 'completed',
          technician: 'John Tech'
        },
        {
          id: '10',
          stepNumber: 2,
          description: 'Software update and reset',
          estimatedTime: 2,
          actualTime: 2,
          status: 'completed',
          technician: 'John Tech'
        },
        {
          id: '11',
          stepNumber: 3,
          description: 'System testing',
          estimatedTime: 1,
          actualTime: 1,
          status: 'completed',
          technician: 'John Tech'
        }
      ]
    }
  ];

  const technicians = [
    'Mike Tech',
    'Sarah Wilson',
    'John Tech',
    'Lisa Martinez',
    'David Brown'
  ];

  const filteredJobs = repairJobs.filter(job => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      queued: { variant: 'outline', icon: Clock },
      'in-progress': { variant: 'default', icon: Play },
      'waiting-parts': { variant: 'secondary', icon: Package },
      completed: { variant: 'default', icon: CheckCircle },
      'on-hold': { variant: 'destructive', icon: Pause }
    };
    return config[status] || { variant: 'outline', icon: Clock };
  };

  const getPartStatusBadge = (status) => {
    const variants = {
      ordered: 'outline',
      'in-transit': 'secondary',
      delivered: 'default',
      installed: 'default'
    };
    return variants[status] || 'outline';
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Play;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Repair & Warranty Execution</h1>
        <p className="text-muted-foreground">Track and manage repair jobs and warranty work</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repairJobs.filter(j => j.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Waiting Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repairJobs.filter(j => j.status === 'waiting-parts').length}
            </div>
            <p className="text-xs text-muted-foreground">Parts on order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repairJobs.filter(j => j.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Jobs finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3</div>
            <p className="text-xs text-muted-foreground">Days per job</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by job number, VIN, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="waiting-parts">Waiting Parts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Repair Jobs</CardTitle>
            <CardDescription>
              {filteredJobs.length} jobs found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job #</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const statusConfig = getStatusBadge(job.status);
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">{job.jobNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.vehicleInfo}</p>
                          <p className="text-sm text-muted-foreground">{job.customerName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{job.assignedTechnician}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{job.progress}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant} className="flex items-center space-x-1 w-fit">
                          <statusConfig.icon className="w-3 h-3" />
                          <span>{job.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
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

        {selectedJob && (
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>{selectedJob.jobNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="parts">Parts</TabsTrigger>
                  <TabsTrigger value="assignment">Assignment</TabsTrigger>
                </TabsList>

                <TabsContent value="progress" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Repair Steps</h4>
                    <div className="space-y-3">
                      {selectedJob.steps.map((step) => {
                        const StatusIcon = getStepStatusIcon(step.status);
                        return (
                          <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                            <StatusIcon className={`w-5 h-5 ${step.status === 'completed' ? 'text-green-600' :
                              step.status === 'in-progress' ? 'text-blue-600' :
                                'text-gray-400'
                              }`} />
                            <div className="flex-1">
                              <p className="font-medium">Step {step.stepNumber}: {step.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Est: {step.estimatedTime}h</span>
                                {step.actualTime && <span>Actual: {step.actualTime}h</span>}
                                {step.technician && <span>Tech: {step.technician}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Overall Progress</h4>
                    <Progress value={selectedJob.progress} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{selectedJob.progress}% Complete</span>
                      <span>Expected: {selectedJob.expectedCompletion}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parts" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Required Parts</h4>
                    {selectedJob.parts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedJob.parts.map((part) => (
                          <div key={part.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{part.partName}</p>
                              <p className="text-sm text-muted-foreground">
                                {part.partNumber} • Qty: {part.quantity}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Supplier: {part.supplier}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={getPartStatusBadge(part.status)}>
                                {part.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                ETA: {part.expectedDelivery}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No parts required for this job.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="assignment" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Technician Assignment</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Assigned Technician</label>
                        <Select value={selectedJob.assignedTechnician}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech} value={tech}>
                                {tech}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Estimated Hours</label>
                          <Input value={selectedJob.estimatedHours} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Actual Hours</label>
                          <Input value={selectedJob.actualHours} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Start Date</label>
                          <Input value={selectedJob.startDate} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Expected Completion</label>
                          <Input value={selectedJob.expectedCompletion} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RepairExecution;
