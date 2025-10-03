import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
  Users,
  Wrench
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const getStatsForRole = () => {
    if (user?.role === 'sc-staff' || user?.role === 'sc-technician') {
      return [
        {
          title: 'Yêu cầu Chờ xử lý',
          value: 23,
          description: 'Yêu cầu bảo hành đang chờ xử lý',
          icon: FileText,
          badge: { text: '5 khẩn cấp', variant: 'destructive' }
        },
        {
          title: 'Sửa chữa Đang thực hiện',
          value: 12,
          description: 'Xe đang được bảo dưỡng',
          icon: Wrench,
          trend: { value: 8, label: 'so với tuần trước' }
        },
        {
          title: 'Hoàn thành Tháng này',
          value: 156,
          description: 'Dịch vụ bảo hành hoàn thành thành công',
          icon: CheckCircle,
          trend: { value: 12, label: 'tăng' }
        },
        {
          title: 'Hài lòng Khách hàng',
          value: '4.8/5',
          description: 'Đánh giá trung bình từ khách hàng',
          icon: Users,
          badge: { text: 'Xuất sắc', variant: 'default' }
        }
      ];
    } else {
      return [
        {
          title: 'Tổng Yêu cầu',
          value: 1247,
          description: 'Yêu cầu được xử lý quý này',
          icon: FileText,
          trend: { value: 15, label: 'so với quý trước' }
        },
        {
          title: 'Chi phí Bảo hành',
          value: '$2.4M',
          description: 'Tổng chi phí bảo hành',
          icon: DollarSign,
          trend: { value: -5, label: 'giảm chi phí' }
        },
        {
          title: 'Tồn kho Linh kiện',
          value: '89%',
          description: 'Tỷ lệ sẵn có linh kiện',
          icon: Package,
          badge: { text: 'Tồn kho tốt', variant: 'default' }
        },
        {
          title: 'Trung tâm Dịch vụ',
          value: 156,
          description: 'Địa điểm dịch vụ hoạt động',
          icon: Users,
          trend: { value: 8, label: 'trung tâm mới' }
        }
      ];
    }
  };

  const getRecentActivity = () => {
    if (user?.role === 'sc-staff' || user?.role === 'sc-technician') {
      return [
        { id: 1, action: 'Yêu cầu bảo hành mới được gửi', vehicle: 'Tesla Model 3 - VIN: 1234567890', time: '2 phút trước', status: 'pending' },
        { id: 2, action: 'Thay thế pin hoàn thành', vehicle: 'BMW iX - VIN: 0987654321', time: '1 giờ trước', status: 'completed' },
        { id: 3, action: 'Lịch hẹn nhận xe đã được sắp xếp', vehicle: 'Audi e-tron - VIN: 1122334455', time: '3 giờ trước', status: 'ready' },
        { id: 4, action: 'Đã đặt hàng linh kiện để sửa chữa', vehicle: 'Nissan Leaf - VIN: 5566778899', time: '5 giờ trước', status: 'in-progress' }
      ];
    } else {
      return [
        { id: 1, action: 'Yêu cầu bảo hành được phê duyệt', vehicle: 'Ford Mustang Mach-E - VIN: 1111222233', time: '15 phút trước', status: 'approved' },
        { id: 2, action: 'Trung tâm dịch vụ mới được đăng ký', vehicle: 'AutoService Plus - Khu vực: Bắc', time: '2 giờ trước', status: 'active' },
        { id: 3, action: 'Chiến dịch thu hồi được khởi động', vehicle: 'Bộ pin Model X', time: '4 giờ trước', status: 'active' },
        { id: 4, action: 'Cảnh báo tồn kho được kích hoạt', vehicle: 'Tồn kho thấp: Bộ điều khiển motor', time: '6 giờ trước', status: 'alert' }
      ];
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'outline',
      completed: 'default',
      ready: 'secondary',
      'in-progress': 'outline',
      approved: 'default',
      active: 'default',
      alert: 'destructive'
    };
    return variants[status] || 'outline';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'chờ xử lý',
      completed: 'hoàn thành',
      ready: 'sẵn sàng',
      'in-progress': 'đang xử lý',
      approved: 'đã phê duyệt',
      active: 'hoạt động',
      alert: 'cảnh báo'
    };
    return statusTexts[status] || status;
  };

  const stats = getStatsForRole();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1>Chào mừng trở lại, {user?.name}</h1>
        <p className="text-muted-foreground">
          {user?.role === 'sc-staff' || user?.role === 'sc-technician'
            ? 'Đây là tổng quan trung tâm dịch vụ của bạn'
            : 'Đây là tổng quan quản lý bảo hành của bạn'
          }
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                {stat.trend && (
                  <div className="flex items-center text-xs">
                    <TrendingUp className={`w-3 h-3 mr-1 ${stat.trend.value > 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={stat.trend.value > 0 ? 'text-green-600' : 'text-red-600'}>
                      {stat.trend.value > 0 ? '+' : ''}{stat.trend.value}%
                    </span>
                    <span className="text-muted-foreground ml-1">{stat.trend.label}</span>
                  </div>
                )}
                {stat.badge && (
                  <Badge variant={stat.badge.variant} className="text-xs">
                    {stat.badge.text}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động Gần đây</CardTitle>
            <CardDescription>Cập nhật và hành động mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.vehicle}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <Badge variant={getStatusBadge(activity.status)} className="text-xs">
                        {getStatusText(activity.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chỉ số Hiệu suất</CardTitle>
            <CardDescription>Các chỉ số hiệu suất chính</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tỷ lệ Giải quyết Yêu cầu</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Hài lòng Khách hàng</span>
                <span className="text-sm text-muted-foreground">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sẵn có Linh kiện</span>
                <span className="text-sm text-muted-foreground">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Thời gian Phản hồi</span>
                <span className="text-sm text-muted-foreground">76%</span>
              </div>
              <Progress value={76} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent, Upcoming, Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Mục Khẩn cấp</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Yêu cầu ưu tiên cao</span>
                <Badge variant="destructive">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sửa chữa quá hạn</span>
                <Badge variant="destructive">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cảnh báo tồn kho thấp</span>
                <Badge variant="outline">8</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Nhiệm vụ Sắp tới</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Kiểm tra xe</p>
                <p className="text-muted-foreground">Hạn hôm nay: 3 xe</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Lịch hẹn thu hồi</p>
                <p className="text-muted-foreground">Đã lên lịch: 7 tuần này</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Giao linh kiện</p>
                <p className="text-muted-foreground">Dự kiến: 12 lô hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Thống kê Nhanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Hoàn thành hôm nay</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Doanh thu tuần này</span>
                <span className="font-medium">$45.2K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Thời gian sửa chữa trung bình</span>
                <span className="font-medium">2.3 ngày</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
