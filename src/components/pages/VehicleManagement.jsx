import React, { useState } from 'react';
import { Search, Plus, Car, FileText, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const VehicleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    color: '',
    mileage: '',
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });

  // Mock data
  const vehicles = [
    {
      id: '1',
      vin: '1HGBH41JXMN109186',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      color: 'White',
      mileage: 15420,
      customerName: 'John Smith',
      customerPhone: '+1-555-0123',
      customerEmail: 'john.smith@email.com',
      warrantyStatus: 'active',
      lastService: '2024-01-15'
    },
    {
      id: '2',
      vin: '5YJ3E1EA9KF123456',
      make: 'BMW',
      model: 'iX',
      year: 2022,
      color: 'Black',
      mileage: 28750,
      customerName: 'Sarah Johnson',
      customerPhone: '+1-555-0456',
      customerEmail: 'sarah.j@email.com',
      warrantyStatus: 'active',
      lastService: '2024-02-01'
    },
    {
      id: '3',
      vin: 'WAUZZZF15HA123789',
      make: 'Audi',
      model: 'e-tron',
      year: 2021,
      color: 'Blue',
      mileage: 45320,
      customerName: 'Mike Davis',
      customerPhone: '+1-555-0789',
      customerEmail: 'mike.davis@email.com',
      warrantyStatus: 'expired',
      lastService: '2023-12-10'
    }
  ];

  const vehicleParts = [
    {
      id: '1',
      partName: 'Battery Pack',
      partNumber: 'BP-2023-001',
      serialNumber: 'SN123456789',
      installDate: '2023-03-15',
      warrantyExpiry: '2031-03-15',
      status: 'active'
    },
    {
      id: '2',
      partName: 'Motor Controller',
      partNumber: 'MC-2023-002',
      serialNumber: 'SN987654321',
      installDate: '2023-03-15',
      warrantyExpiry: '2026-03-15',
      status: 'active'
    },
    {
      id: '3',
      partName: 'Charging Port',
      partNumber: 'CP-2023-003',
      serialNumber: 'SN456789123',
      installDate: '2023-03-15',
      warrantyExpiry: '2028-03-15',
      status: 'replaced'
    }
  ];

  const serviceHistory = [
    {
      id: '1',
      date: '2024-01-15',
      serviceType: 'Routine Maintenance',
      description: 'Battery health check, software update',
      technician: 'Mike Tech',
      cost: 150,
      status: 'completed'
    },
    {
      id: '2',
      date: '2023-08-22',
      serviceType: 'Warranty Repair',
      description: 'Charging port replacement',
      technician: 'Sarah Wilson',
      cost: 0,
      status: 'completed'
    },
    {
      id: '3',
      date: '2023-03-15',
      serviceType: 'Initial Setup',
      description: 'Vehicle delivery and setup',
      technician: 'John Tech',
      cost: 0,
      status: 'completed'
    }
  ];

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWarrantyBadge = (status) => {
    const variants = {
      active: 'default',
      expired: 'destructive',
      voided: 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getPartStatusBadge = (status) => {
    const variants = {
      active: 'default',
      replaced: 'secondary',
      recalled: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const handleAddVehicle = () => {
    // In a real app, this would make an API call
    console.log('Adding vehicle:', newVehicle);
    setIsAddDialogOpen(false);
    setNewVehicle({
      vin: '',
      make: '',
      model: '',
      year: '',
      color: '',
      mileage: '',
      customerName: '',
      customerPhone: '',
      customerEmail: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý Xe</h1>
          <p className="text-muted-foreground">Quản lý xe và theo dõi thông tin bảo hành</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Đăng ký Xe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Đăng ký Xe Mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết của xe để đăng ký vào hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">Số VIN</Label>
                <Input
                  id="vin"
                  value={newVehicle.vin}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                  placeholder="Nhập số VIN"
                />
              </div>
              <div>
                <Label htmlFor="make">Hãng xe</Label>
                <Select value={newVehicle.make} onValueChange={(value) => setNewVehicle({ ...newVehicle, make: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hãng xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tesla">Tesla</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                    <SelectItem value="Mercedes">Mercedes</SelectItem>
                    <SelectItem value="Nissan">Nissan</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="model">Mẫu xe</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  placeholder="Nhập mẫu xe"
                />
              </div>
              <div>
                <Label htmlFor="year">Năm sản xuất</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                  placeholder="Nhập năm sản xuất"
                />
              </div>
              <div>
                <Label htmlFor="color">Màu sắc</Label>
                <Input
                  id="color"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  placeholder="Nhập màu sắc"
                />
              </div>
              <div>
                <Label htmlFor="mileage">Số km đã đi</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={newVehicle.mileage}
                  onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                  placeholder="Nhập số km"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="customerName">Tên khách hàng</Label>
                <Input
                  id="customerName"
                  value={newVehicle.customerName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, customerName: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  value={newVehicle.customerPhone}
                  onChange={(e) => setNewVehicle({ ...newVehicle, customerPhone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email khách hàng</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newVehicle.customerEmail}
                  onChange={(e) => setNewVehicle({ ...newVehicle, customerEmail: e.target.value })}
                  placeholder="Nhập email"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddVehicle}>
                Đăng ký Xe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm Xe</CardTitle>
          <CardDescription>Tìm kiếm theo VIN, tên khách hàng hoặc thông tin xe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Xe Đã Đăng Ký</CardTitle>
              <CardDescription>
                Tìm thấy {filteredVehicles.length} xe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Xe</TableHead>
                      <TableHead>VIN</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Bảo hành</TableHead>
                      <TableHead>Dịch vụ cuối</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.color} • {vehicle.mileage.toLocaleString()} km</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{vehicle.vin}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.customerName}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getWarrantyBadge(vehicle.warrantyStatus)}>
                            {vehicle.warrantyStatus === 'active' ? 'Còn hạn' :
                              vehicle.warrantyStatus === 'expired' ? 'Hết hạn' : 'Vô hiệu'}
                          </Badge>
                        </TableCell>
                        <TableCell>{vehicle.lastService}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="whitespace-nowrap"
                          >
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle card details */}
        {selectedVehicle && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="w-5 h-5" />
                  <span>Chi tiết Xe</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h4>
                    <p className="text-sm text-muted-foreground">VIN: {selectedVehicle.vin}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Thông tin Khách hàng</h5>
                    <p className="text-sm">{selectedVehicle.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedVehicle.customerEmail}</p>
                    <p className="text-sm text-muted-foreground">{selectedVehicle.customerPhone}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">Trạng thái Xe</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getWarrantyBadge(selectedVehicle.warrantyStatus)}>
                        {selectedVehicle.warrantyStatus === 'active' ? 'Còn hạn' :
                          selectedVehicle.warrantyStatus === 'expired' ? 'Hết hạn' : 'Vô hiệu'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tabs for selected vehicle */}
      {selectedVehicle && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin Chi tiết Xe</CardTitle>
            <CardDescription>
              Thông tin chi tiết cho {selectedVehicle.make} {selectedVehicle.model}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="parts" className="w-full">
              <TabsList>
                <TabsTrigger value="parts" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Linh kiện & Phụ tùng</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Lịch sử Dịch vụ</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="parts">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên linh kiện</TableHead>
                        <TableHead>Mã linh kiện</TableHead>
                        <TableHead>Số Serial</TableHead>
                        <TableHead>Ngày lắp đặt</TableHead>
                        <TableHead>Hết hạn bảo hành</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicleParts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.partName}</TableCell>
                          <TableCell className="font-mono text-sm">{part.partNumber}</TableCell>
                          <TableCell className="font-mono text-sm">{part.serialNumber}</TableCell>
                          <TableCell>{part.installDate}</TableCell>
                          <TableCell>{part.warrantyExpiry}</TableCell>
                          <TableCell>
                            <Badge variant={getPartStatusBadge(part.status)}>
                              {part.status === 'active' ? 'Hoạt động' :
                                part.status === 'replaced' ? 'Đã thay thế' : 'Thu hồi'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Loại dịch vụ</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Kỹ thuật viên</TableHead>
                        <TableHead>Chi phí</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell className="font-medium">
                            {record.serviceType === 'Routine Maintenance' ? 'Bảo dưỡng định kỳ' :
                              record.serviceType === 'Warranty Repair' ? 'Sửa chữa bảo hành' :
                                record.serviceType === 'Initial Setup' ? 'Cài đặt ban đầu' : record.serviceType}
                          </TableCell>
                          <TableCell>
                            {record.description === 'Battery health check, software update' ? 'Kiểm tra pin, cập nhật phần mềm' :
                              record.description === 'Charging port replacement' ? 'Thay thế cổng sạc' :
                                record.description === 'Vehicle delivery and setup' ? 'Giao xe và cài đặt' : record.description}
                          </TableCell>
                          <TableCell>{record.technician}</TableCell>
                          <TableCell>${record.cost}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'completed' ? 'default' : 'outline'}>
                              {record.status === 'completed' ? 'Hoàn thành' :
                                record.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleManagement;
