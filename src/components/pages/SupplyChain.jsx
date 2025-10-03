import React, { useState } from 'react';
import { Search, Package, AlertTriangle, Truck, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const SupplyChain = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data
  const inventoryItems = [
    {
      id: '1',
      partNumber: 'BP-2023-001',
      partName: 'High Voltage Battery Pack',
      category: 'Battery',
      currentStock: 12,
      reorderPoint: 10,
      maxStock: 50,
      unitCost: 15000,
      supplier: 'PowerCell Industries',
      leadTime: 14,
      lastRestocked: '2024-01-10',
      status: 'low-stock',
      pendingOrders: 25
    },
    {
      id: '2',
      partNumber: 'MC-2023-001',
      partName: 'Traction Motor Controller',
      category: 'Motor',
      currentStock: 45,
      reorderPoint: 15,
      maxStock: 80,
      unitCost: 3500,
      supplier: 'MotorTech Solutions',
      leadTime: 7,
      lastRestocked: '2024-01-20',
      status: 'in-stock',
      pendingOrders: 0
    },
    {
      id: '3',
      partNumber: 'CP-2023-001',
      partName: 'CCS Charging Port Assembly',
      category: 'Charging',
      currentStock: 0,
      reorderPoint: 20,
      maxStock: 100,
      unitCost: 450,
      supplier: 'ChargeTech Corp',
      leadTime: 5,
      lastRestocked: '2024-01-05',
      status: 'out-of-stock',
      pendingOrders: 50
    },
    {
      id: '4',
      partNumber: 'IC-2023-001',
      partName: 'Infotainment Control Unit',
      category: 'Electronics',
      currentStock: 32,
      reorderPoint: 12,
      maxStock: 60,
      unitCost: 1200,
      supplier: 'InfoSys Technologies',
      leadTime: 10,
      lastRestocked: '2024-01-25',
      status: 'in-stock',
      pendingOrders: 0
    }
  ];

  const suppliers = [
    {
      id: '1',
      name: 'PowerCell Industries',
      location: 'California, USA',
      rating: 4.5,
      onTimeDelivery: 92,
      qualityScore: 94,
      totalOrders: 156,
      activeContracts: 3,
      status: 'active',
      contact: 'orders@powercell.com'
    },
    {
      id: '2',
      name: 'MotorTech Solutions',
      location: 'Michigan, USA',
      rating: 4.8,
      onTimeDelivery: 96,
      qualityScore: 98,
      totalOrders: 234,
      activeContracts: 5,
      status: 'active',
      contact: 'sales@motortech.com'
    },
    {
      id: '3',
      name: 'ChargeTech Corp',
      location: 'Texas, USA',
      rating: 4.2,
      onTimeDelivery: 88,
      qualityScore: 89,
      totalOrders: 89,
      activeContracts: 2,
      status: 'active',
      contact: 'support@chargetech.com'
    },
    {
      id: '4',
      name: 'InfoSys Technologies',
      location: 'Washington, USA',
      rating: 4.6,
      onTimeDelivery: 94,
      qualityScore: 92,
      totalOrders: 67,
      activeContracts: 2,
      status: 'active',
      contact: 'procurement@infosys.com'
    }
  ];

  const purchaseOrders = [
    {
      id: '1',
      orderNumber: 'PO-2024-001',
      supplier: 'PowerCell Industries',
      orderDate: '2024-01-28',
      expectedDelivery: '2024-02-11',
      status: 'confirmed',
      totalValue: 375000,
      items: [
        { partNumber: 'BP-2023-001', partName: 'High Voltage Battery Pack', quantity: 25, unitCost: 15000 }
      ]
    },
    {
      id: '2',
      orderNumber: 'PO-2024-002',
      supplier: 'ChargeTech Corp',
      orderDate: '2024-01-30',
      expectedDelivery: '2024-02-04',
      status: 'shipped',
      totalValue: 22500,
      items: [
        { partNumber: 'CP-2023-001', partName: 'CCS Charging Port Assembly', quantity: 50, unitCost: 450 }
      ]
    },
    {
      id: '3',
      orderNumber: 'PO-2024-003',
      supplier: 'MotorTech Solutions',
      orderDate: '2024-02-01',
      expectedDelivery: '2024-02-08',
      status: 'pending',
      totalValue: 105000,
      items: [
        { partNumber: 'MC-2023-001', partName: 'Traction Motor Controller', quantity: 30, unitCost: 3500 }
      ]
    }
  ];

  const categories = ['Battery', 'Motor', 'Charging', 'Electronics', 'Cooling', 'Braking'];

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch =
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const variants = {
      'in-stock': 'default',
      'low-stock': 'secondary',
      'out-of-stock': 'destructive',
      'on-order': 'outline'
    };
    return variants[status] || 'outline';
  };

  const getOrderStatusBadge = (status) => {
    const variants = {
      pending: 'outline',
      confirmed: 'secondary',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getSupplierStatusBadge = (status) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      probation: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getStockLevel = (current, reorder, max) => {
    const percentage = (current / max) * 100;
    return Math.min(percentage, 100);
  };

  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.reorderPoint);
  const outOfStockItems = inventoryItems.filter(item => item.currentStock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1>Supply Chain Management</h1>
        <p className="text-muted-foreground">Manage inventory, suppliers, and purchase orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Package className="w-4 h-4 mr-2 text-red-500" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Urgent restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Inventory</CardTitle>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="on-order">On Order</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
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
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                {filteredInventory.length} items found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Details</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const stockPercentage = getStockLevel(item.currentStock, item.reorderPoint, item.maxStock);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.partName}</p>
                            <p className="text-sm text-muted-foreground">{item.partNumber}</p>
                            <Badge variant="outline" className="mt-1">{item.category}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.currentStock}/{item.maxStock}</span>
                              <span>{stockPercentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={stockPercentage} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Reorder at: {item.reorderPoint}
                            </p>
                            {item.pendingOrders > 0 && (
                              <p className="text-xs text-blue-600">
                                +{item.pendingOrders} on order
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${item.unitCost.toLocaleString()}</TableCell>
                        <TableCell>{item.leadTime} days</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>Key metrics and ratings for active suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>On-Time Delivery</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Contracts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.location}</p>
                          <p className="text-xs text-muted-foreground">{supplier.contact}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{supplier.rating}</span>
                          <span className="text-muted-foreground">/5.0</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{supplier.onTimeDelivery}%</div>
                          <Progress value={supplier.onTimeDelivery} className="h-2 mt-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{supplier.qualityScore}%</div>
                          <Progress value={supplier.qualityScore} className="h-2 mt-1" />
                        </div>
                      </TableCell>
                      <TableCell>{supplier.totalOrders}</TableCell>
                      <TableCell>{supplier.activeContracts}</TableCell>
                      <TableCell>
                        <Badge variant={getSupplierStatusBadge(supplier.status)}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>Track orders and delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.orderNumber}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.expectedDelivery}</TableCell>
                      <TableCell className="font-medium">${order.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{item.quantity}x</span> {item.partName}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getOrderStatusBadge(order.status)} className="flex items-center space-x-1 w-fit">
                          <Truck className="w-3 h-3" />
                          <span>{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Track
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplyChain;
