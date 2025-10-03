import React, { useState } from 'react';
import { Search, Plus, Edit, Package, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [newComponent, setNewComponent] = useState({
    partNumber: '',
    partName: '',
    category: '',
    supplier: '',
    warrantyPeriod: '',
    cost: '',
    inventoryLevel: '',
    reorderPoint: '',
    compatibleModels: '',
    specifications: ''
  });

  // Mock data
  const evComponents = [
    {
      id: '1',
      partNumber: 'BP-2023-001',
      partName: 'High Voltage Battery Pack',
      category: 'Battery',
      supplier: 'PowerCell Industries',
      warrantyPeriod: 96,
      cost: 15000,
      inventoryLevel: 25,
      reorderPoint: 10,
      status: 'active',
      compatibleModels: ['Model 3', 'Model Y'],
      specifications: '75kWh capacity, 400V nominal, Lithium-ion chemistry'
    },
    {
      id: '2',
      partNumber: 'MC-2023-001',
      partName: 'Traction Motor Controller',
      category: 'Motor',
      supplier: 'MotorTech Solutions',
      warrantyPeriod: 60,
      cost: 3500,
      inventoryLevel: 45,
      reorderPoint: 15,
      status: 'active',
      compatibleModels: ['Model 3', 'Model S'],
      specifications: 'Max power: 250kW, Efficiency: 95%, Weight: 45kg'
    },
    {
      id: '3',
      partNumber: 'CP-2023-001',
      partName: 'CCS Charging Port Assembly',
      category: 'Charging',
      supplier: 'ChargeTech Corp',
      warrantyPeriod: 36,
      cost: 450,
      inventoryLevel: 8,
      reorderPoint: 20,
      status: 'active',
      compatibleModels: ['Model 3', 'Model Y', 'Model S'],
      specifications: 'CCS2 compatible, IP65 rated, Max current: 250A'
    },
    {
      id: '4',
      partNumber: 'IC-2023-001',
      partName: 'Infotainment Control Unit',
      category: 'Electronics',
      supplier: 'InfoSys Technologies',
      warrantyPeriod: 24,
      cost: 1200,
      inventoryLevel: 32,
      reorderPoint: 12,
      status: 'active',
      compatibleModels: ['Model 3', 'Model Y'],
      specifications: '15" touchscreen, 8-core processor, 32GB storage'
    },
    {
      id: '5',
      partNumber: 'TC-2022-001',
      partName: 'Thermal Management System',
      category: 'Cooling',
      supplier: 'CoolFlow Systems',
      warrantyPeriod: 48,
      cost: 2100,
      inventoryLevel: 15,
      reorderPoint: 8,
      status: 'discontinued',
      compatibleModels: ['Model S (Legacy)'],
      specifications: 'Liquid cooling, 5kW capacity, R134a refrigerant'
    }
  ];

  const warrantyPolicies = [
    {
      id: '1',
      policyName: 'Standard Battery Warranty',
      category: 'Battery',
      warrantyPeriod: 96,
      coverage: 'Defects in materials and workmanship, capacity degradation below 70%',
      conditions: 'Normal use conditions, regular maintenance required',
      effectiveDate: '2023-01-01',
      expiryDate: '2025-12-31',
      status: 'active'
    },
    {
      id: '2',
      policyName: 'Motor System Warranty',
      category: 'Motor',
      warrantyPeriod: 60,
      coverage: 'Manufacturing defects, performance issues',
      conditions: 'Proper installation and usage guidelines followed',
      effectiveDate: '2023-01-01',
      expiryDate: '2025-12-31',
      status: 'active'
    },
    {
      id: '3',
      policyName: 'Electronics Warranty',
      category: 'Electronics',
      warrantyPeriod: 24,
      coverage: 'Hardware failures, software defects',
      conditions: 'No unauthorized modifications or repairs',
      effectiveDate: '2023-01-01',
      expiryDate: '2024-12-31',
      status: 'active'
    }
  ];

  const categories = ['Battery', 'Motor', 'Charging', 'Electronics', 'Cooling', 'Braking', 'Suspension'];

  const filteredComponents = evComponents.filter(component => {
    const matchesSearch =
      component.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      discontinued: 'destructive',
      development: 'secondary'
    };
    return variants[status] || 'outline';
  };

  const getInventoryStatus = (current, reorder) => {
    if (current <= reorder) return { status: 'low', variant: 'destructive' };
    if (current <= reorder * 1.5) return { status: 'medium', variant: 'secondary' };
    return { status: 'good', variant: 'default' };
  };

  const handleAddComponent = () => {
    console.log('Adding component:', newComponent);
    setIsAddDialogOpen(false);
    setNewComponent({
      partNumber: '',
      partName: '',
      category: '',
      supplier: '',
      warrantyPeriod: '',
      cost: '',
      inventoryLevel: '',
      reorderPoint: '',
      compatibleModels: '',
      specifications: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Product & Spare Parts Management</h1>
          <p className="text-muted-foreground">Manage EV components, inventory, and warranty policies</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage Policies
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Warranty Policies</DialogTitle>
                <DialogDescription>Manage warranty policies for different component categories</DialogDescription>
              </DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warrantyPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.policyName}</TableCell>
                      <TableCell>{policy.category}</TableCell>
                      <TableCell>{policy.warrantyPeriod} months</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(policy.status)}>
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Component</DialogTitle>
                <DialogDescription>Enter details for the new EV component</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partNumber">Part Number</Label>
                  <Input
                    id="partNumber"
                    value={newComponent.partNumber}
                    onChange={(e) => setNewComponent({ ...newComponent, partNumber: e.target.value })}
                    placeholder="Enter part number"
                  />
                </div>
                <div>
                  <Label htmlFor="partName">Part Name</Label>
                  <Input
                    id="partName"
                    value={newComponent.partName}
                    onChange={(e) => setNewComponent({ ...newComponent, partName: e.target.value })}
                    placeholder="Enter part name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newComponent.category} onValueChange={(value) => setNewComponent({ ...newComponent, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newComponent.supplier}
                    onChange={(e) => setNewComponent({ ...newComponent, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyPeriod">Warranty Period (months)</Label>
                  <Input
                    id="warrantyPeriod"
                    type="number"
                    value={newComponent.warrantyPeriod}
                    onChange={(e) => setNewComponent({ ...newComponent, warrantyPeriod: e.target.value })}
                    placeholder="Enter warranty period"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newComponent.cost}
                    onChange={(e) => setNewComponent({ ...newComponent, cost: e.target.value })}
                    placeholder="Enter cost"
                  />
                </div>
                <div>
                  <Label htmlFor="inventoryLevel">Current Inventory</Label>
                  <Input
                    id="inventoryLevel"
                    type="number"
                    value={newComponent.inventoryLevel}
                    onChange={(e) => setNewComponent({ ...newComponent, inventoryLevel: e.target.value })}
                    placeholder="Enter current stock"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={newComponent.reorderPoint}
                    onChange={(e) => setNewComponent({ ...newComponent, reorderPoint: e.target.value })}
                    placeholder="Enter reorder threshold"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="compatibleModels">Compatible Models</Label>
                  <Input
                    id="compatibleModels"
                    value={newComponent.compatibleModels}
                    onChange={(e) => setNewComponent({ ...newComponent, compatibleModels: e.target.value })}
                    placeholder="Enter compatible models (comma separated)"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="specifications">Specifications</Label>
                  <Textarea
                    id="specifications"
                    value={newComponent.specifications}
                    onChange={(e) => setNewComponent({ ...newComponent, specifications: e.target.value })}
                    placeholder="Enter technical specifications"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddComponent}>
                  Add Component
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evComponents.length}</div>
            <p className="text-xs text-muted-foreground">Active parts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evComponents.filter(c => c.inventoryLevel <= c.reorderPoint).length}
            </div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${evComponents.reduce((sum, c) => sum + (c.cost * c.inventoryLevel), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warrantyPolicies.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Warranty policies</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by part number, name, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EV Components</CardTitle>
          <CardDescription>
            {filteredComponents.length} components found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.map((component) => {
                const inventoryStatus = getInventoryStatus(component.inventoryLevel, component.reorderPoint);
                return (
                  <TableRow key={component.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{component.partName}</p>
                        <p className="text-sm text-muted-foreground">{component.partNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          Models: {component.compatibleModels.join(', ')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{component.category}</Badge>
                    </TableCell>
                    <TableCell>{component.supplier}</TableCell>
                    <TableCell>{component.warrantyPeriod} months</TableCell>
                    <TableCell className="font-medium">${component.cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{component.inventoryLevel}</span>
                          <Badge variant={inventoryStatus.variant} className="text-xs">
                            {inventoryStatus.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Reorder at: {component.reorderPoint}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(component.status)}>
                        {component.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Package className="w-4 h-4" />
                        </Button>
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

export default ProductManagement;
