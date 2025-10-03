import React, { useState } from "react";
import {
  Search,
  Plus,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuth } from "../../context/AuthContext";
import { useClaims } from "../../context/ClaimsContext";

const WarrantyClaims = () => {
  const { user } = useAuth();
  const { claims, addClaim } = useClaims();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClaim, setNewClaim] = useState({
    vin: "",
    problemDescription: "",
    diagnosticReport: "",
    estimatedCost: "",
  });

  // Lọc claim
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Badge trạng thái
  const getStatusBadge = (status) => {
    const config = {
      submitted: { variant: "outline", icon: Clock },
      pending: { variant: "secondary", icon: AlertCircle },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: AlertCircle },
      completed: { variant: "default", icon: CheckCircle },
    };
    return config[status] || { variant: "outline", icon: Clock };
  };

  // SC Staff gửi claim
  const handleSubmitClaim = () => {
    if (!newClaim.vin || !newClaim.problemDescription) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    addClaim({
      ...newClaim,
      submittedBy: user?.name || "Unknown",
    });
    setIsAddDialogOpen(false);
    setNewClaim({
      vin: "",
      problemDescription: "",
      diagnosticReport: "",
      estimatedCost: "",
    });
  };

  const canSubmitClaims =
    user?.role === "sc-staff" || user?.role === "sc-technician";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý Yêu cầu Bảo hành</h1>
          <p className="text-muted-foreground">
            {canSubmitClaims
              ? "Gửi và theo dõi yêu cầu bảo hành"
              : "Xem xét và quản lý yêu cầu bảo hành"}
          </p>
        </div>
        {canSubmitClaims && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Gửi Yêu cầu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gửi Yêu cầu Bảo hành</DialogTitle>
                <DialogDescription>
                  Điền chi tiết cho yêu cầu bảo hành
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vin">Số VIN xe</Label>
                  <Input
                    id="vin"
                    value={newClaim.vin}
                    onChange={(e) =>
                      setNewClaim({ ...newClaim, vin: e.target.value })
                    }
                    placeholder="Nhập số VIN"
                  />
                </div>
                <div>
                  <Label htmlFor="problemDescription">Mô tả Vấn đề</Label>
                  <Textarea
                    id="problemDescription"
                    value={newClaim.problemDescription}
                    onChange={(e) =>
                      setNewClaim({
                        ...newClaim,
                        problemDescription: e.target.value,
                      })
                    }
                    placeholder="Mô tả chi tiết vấn đề..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosticReport">Báo cáo Chẩn đoán</Label>
                  <Textarea
                    id="diagnosticReport"
                    value={newClaim.diagnosticReport}
                    onChange={(e) =>
                      setNewClaim({
                        ...newClaim,
                        diagnosticReport: e.target.value,
                      })
                    }
                    placeholder="Nhập kết quả chẩn đoán..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">
                    Chi phí Sửa chữa Ước tính ($)
                  </Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={newClaim.estimatedCost}
                    onChange={(e) =>
                      setNewClaim({
                        ...newClaim,
                        estimatedCost: e.target.value,
                      })
                    }
                    placeholder="Nhập chi phí ước tính"
                  />
                </div>
                <div>
                  <Label>Tệp đính kèm</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Kéo thả tệp vào đây hoặc nhấp để tải lên
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chấp nhận PDF, hình ảnh và log
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Chọn Tệp
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleSubmitClaim}>Gửi Yêu cầu</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tổng Yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-xs text-muted-foreground">Tất cả</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chờ Xem xét</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                claims.filter((c) => c.status === "pending" || c.status === "submitted")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Chờ phê duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Đã Phê duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claims.filter((c) => c.status === "approved").length}
            </div>
            <p className="text-xs text-muted-foreground">Sẵn sàng sửa chữa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tổng Giá trị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {claims
                .reduce((sum, claim) => sum + Number(claim.estimatedCost || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Chi phí ước tính</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm & Lọc Yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo số yêu cầu, VIN hoặc khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Trạng thái</SelectItem>
                <SelectItem value="submitted">Đã gửi</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="approved">Đã phê duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims table */}
      <Card>
        <CardHeader>
          <CardTitle>Yêu cầu Bảo hành</CardTitle>
          <CardDescription>
            Tìm thấy {filteredClaims.length} yêu cầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số YC</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Vấn đề</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Chi phí</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => {
                  const statusConfig = getStatusBadge(claim.status);
                  const getStatusText = (status) => {
                    const statusTexts = {
                      submitted: "Đã gửi",
                      pending: "Chờ xử lý",
                      approved: "Đã phê duyệt",
                      rejected: "Bị từ chối",
                      completed: "Hoàn thành",
                    };
                    return statusTexts[status] || status;
                  };

                  return (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-sm">
                        {claim.claimNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{claim.vehicleInfo}</p>
                          <p className="text-sm text-muted-foreground">
                            VIN: {claim.vin}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {claim.customerName || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p
                            className="text-sm truncate"
                            title={claim.problemDescription}
                          >
                            {claim.problemDescription}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{claim.submittedDate}</p>
                          <p className="text-xs text-muted-foreground">
                            bởi {claim.submittedBy}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(claim.estimatedCost || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConfig.variant}
                          className="flex items-center space-x-1 w-fit"
                        >
                          <statusConfig.icon className="w-3 h-3" />
                          <span>{getStatusText(claim.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarrantyClaims;
