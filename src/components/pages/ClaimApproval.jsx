import React, { useState } from 'react';
import { Search, Eye, CheckCircle, X, Clock, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

const ClaimApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Mock data
  const claimsForApproval = [
    {
      id: '1',
      claimNumber: 'WC-2024-001',
      vin: '1HGBH41JXMN109186',
      vehicleInfo: '2023 Tesla Model 3',
      customerName: 'John Smith',
      serviceCenter: 'AutoService Plus',
      submittedBy: 'Mike Tech',
      submittedDate: '2024-01-15',
      problemDescription: 'Battery charging issues - vehicle not accepting charge above 80%. Customer reports degraded performance over the last month.',
      diagnosticReport: 'Battery management system fault detected. Cell imbalance in module 3. Voltage differential: 0.5V between cells. Temperature sensors showing normal readings. No physical damage observed.',
      estimatedCost: 2500,
      partsRequired: ['Battery Management Module', 'Wiring Harness'],
      laborHours: 8,
      status: 'pending',
      priority: 'high',
      attachments: ['diagnostic_report.pdf', 'cell_voltage_data.xlsx', 'photos.zip'],
      warrantyValidUntil: '2031-03-15',
      previousClaims: 0
    },
    {
      id: '2',
      claimNumber: 'WC-2024-002',
      vin: '5YJ3E1EA9KF123456',
      vehicleInfo: '2022 BMW iX',
      customerName: 'Sarah Johnson',
      serviceCenter: 'Premium EV Service',
      submittedBy: 'Sarah Wilson',
      submittedDate: '2024-01-20',
      problemDescription: 'Motor making unusual noise during acceleration, especially at highway speeds.',
      diagnosticReport: 'Motor bearing wear detected in front axle motor assembly. Noise frequency correlates with motor RPM. No overheating detected.',
      estimatedCost: 3200,
      partsRequired: ['Front Motor Assembly'],
      laborHours: 12,
      status: 'under-review',
      priority: 'medium',
      attachments: ['diagnostic_report.pdf', 'sound_analysis.wav'],
      warrantyValidUntil: '2026-02-10',
      previousClaims: 1
    },
    {
      id: '3',
      claimNumber: 'WC-2024-003',
      vin: 'WAUZZZF15HA123789',
      vehicleInfo: '2021 Audi e-tron',
      customerName: 'Mike Davis',
      serviceCenter: 'EuroTech Motors',
      submittedBy: 'John Tech',
      submittedDate: '2024-01-25',
      problemDescription: 'Infotainment system randomly rebooting during normal operation.',
      diagnosticReport: 'Software corruption in main ECU. Hardware appears functional. Memory diagnostic shows intermittent failures.',
      estimatedCost: 800,
      partsRequired: [],
      laborHours: 4,
      status: 'pending',
      priority: 'low',
      attachments: ['error_logs.txt', 'system_diagnostics.pdf'],
      warrantyValidUntil: '2024-03-20',
      previousClaims: 2
    },
    {
      id: '4',
      claimNumber: 'WC-2024-004',
      vin: '1N4AZ1CP8JC123456',
      vehicleInfo: '2023 Nissan Leaf',
      customerName: 'Emily Brown',
      serviceCenter: 'QuickFix Auto',
      submittedBy: 'Lisa Martinez',
      submittedDate: '2024-02-01',
      problemDescription: 'Charging port door stuck in closed position, preventing access to charging port.',
      diagnosticReport: 'Actuator motor failure in charging port mechanism. Physical inspection shows worn gear teeth.',
      estimatedCost: 450,
      partsRequired: ['Charging Port Actuator'],
      laborHours: 2,
      status: 'approved',
      priority: 'medium',
      attachments: ['repair_photos.zip', 'part_inspection.pdf'],
      warrantyValidUntil: '2026-01-15',
      previousClaims: 0
    }
  ];

  const filteredClaims = claimsForApproval.filter(claim => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.serviceCenter.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'outline', icon: Clock },
      'under-review': { variant: 'secondary', icon: Eye },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: X }
    };
    return config[status] || { variant: 'outline', icon: Clock };
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[priority] || 'outline';
  };

  const handleApprovalDecision = () => {
    if (!selectedClaim || !approvalDecision) return;
    console.log('Approval decision:', {
      claimId: selectedClaim.id,
      decision: approvalDecision,
      notes: approvalNotes
    });
    setIsApprovalDialogOpen(false);
    setApprovalDecision(null);
    setApprovalNotes('');
    setSelectedClaim(null);
  };

  const isWarrantyValid = (date) => {
    return new Date(date) > new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Warranty Claim Approval</h1>
        <p className="text-muted-foreground">Review and approve warranty claims from service centers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claimsForApproval.filter(c => c.status === 'pending' || c.status === 'under-review').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claimsForApproval.filter(c => c.priority === 'high' || c.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent claims</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${claimsForApproval.filter(c => c.status === 'pending' || c.status === 'under-review')
                .reduce((sum, c) => sum + c.estimatedCost, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by claim number, VIN, customer, or service center..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claims for Approval</CardTitle>
          <CardDescription>
            {filteredClaims.length} claims found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Details</TableHead>
                <TableHead>Vehicle & Customer</TableHead>
                <TableHead>Service Center</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => {
                const statusConfig = getStatusBadge(claim.status);
                const warrantyValid = isWarrantyValid(claim.warrantyValidUntil);

                return (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{claim.claimNumber}</p>
                        <p className="text-sm text-muted-foreground">VIN: {claim.vin}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {claim.submittedDate} by {claim.submittedBy}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{claim.vehicleInfo}</p>
                        <p className="text-sm text-muted-foreground">{claim.customerName}</p>
                        {claim.previousClaims > 0 && (
                          <p className="text-xs text-orange-600">
                            {claim.previousClaims} previous claims
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{claim.serviceCenter}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${claim.estimatedCost.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{claim.laborHours}h labor</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadge(claim.priority)}>
                        {claim.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant={warrantyValid ? 'default' : 'destructive'}>
                          {warrantyValid ? 'Valid' : 'Expired'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Until: {claim.warrantyValidUntil}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant} className="flex items-center space-x-1 w-fit">
                        <statusConfig.icon className="w-3 h-3" />
                        <span>{claim.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedClaim(claim)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Claim Details - {claim.claimNumber}</DialogTitle>
                              <DialogDescription>
                                Review claim information and make approval decision
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Vehicle Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Vehicle:</span> {claim.vehicleInfo}</p>
                                    <p><span className="font-medium">VIN:</span> {claim.vin}</p>
                                    <p><span className="font-medium">Customer:</span> {claim.customerName}</p>
                                    <p><span className="font-medium">Service Center:</span> {claim.serviceCenter}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Problem Description</h4>
                                  <p className="text-sm text-muted-foreground">{claim.problemDescription}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Diagnostic Report</h4>
                                  <p className="text-sm text-muted-foreground">{claim.diagnosticReport}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Cost Breakdown</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Estimated Cost:</span> ${claim.estimatedCost.toLocaleString()}</p>
                                    <p><span className="font-medium">Labor Hours:</span> {claim.laborHours}h</p>
                                    <p><span className="font-medium">Parts Required:</span></p>
                                    <ul className="list-disc list-inside ml-4 text-muted-foreground">
                                      {claim.partsRequired.map((part, index) => (
                                        <li key={index}>{part}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Warranty Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Valid Until:</span> {claim.warrantyValidUntil}</p>
                                    <p><span className="font-medium">Previous Claims:</span> {claim.previousClaims}</p>
                                    <p><span className="font-medium">Priority:</span>
                                      <Badge variant={getPriorityBadge(claim.priority)} className="ml-2">
                                        {claim.priority}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Attachments</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {claim.attachments.map((attachment, index) => (
                                      <Badge key={index} variant="outline" className="cursor-pointer">
                                        <FileText className="w-3 h-3 mr-1" />
                                        {attachment}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {(claim.status === 'pending' || claim.status === 'under-review') && (
                                  <div className="pt-4">
                                    <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button className="w-full">Make Decision</Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Approval Decision</DialogTitle>
                                          <DialogDescription>
                                            Make your decision for claim {claim.claimNumber}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label>Decision</Label>
                                            <div className="flex space-x-2 mt-2">
                                              <Button
                                                variant={approvalDecision === 'approve' ? 'default' : 'outline'}
                                                onClick={() => setApprovalDecision('approve')}
                                                className="flex items-center space-x-2"
                                              >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Approve</span>
                                              </Button>
                                              <Button
                                                variant={approvalDecision === 'reject' ? 'destructive' : 'outline'}
                                                onClick={() => setApprovalDecision('reject')}
                                                className="flex items-center space-x-2"
                                              >
                                                <X className="w-4 h-4" />
                                                <span>Reject</span>
                                              </Button>
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                              id="notes"
                                              value={approvalNotes}
                                              onChange={(e) => setApprovalNotes(e.target.value)}
                                              placeholder="Add any comments or conditions..."
                                              rows={3}
                                            />
                                          </div>
                                          <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                                              Cancel
                                            </Button>
                                            <Button onClick={handleApprovalDecision} disabled={!approvalDecision}>
                                              Submit Decision
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {(claim.status === 'pending' || claim.status === 'under-review') && (
                          <Button variant="outline" size="sm" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimApproval;
