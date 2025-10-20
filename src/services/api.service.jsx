import axios from "./axios.customize";

// {Auth}
// Login API
export const userLoginApi = (user, password) => {
  const URL_BACKEND = "/api/auth/token";
  const data = { user, password };

  return axios.post(URL_BACKEND, data);
};

// Create User API
export const createUserApi = async (userData) => {
  const URL_BACKEND = "/api/auth/user";

  const data = {
    email: userData.email,
    name: userData.name,
    phoneNumber: userData.phoneNumber,
    role: userData.role,
    serviceCenterId: userData.serviceCenterId,
  };

  return axios.post(URL_BACKEND, data);
};

// Get all users
export const getAllUsersApi = () => {
  return axios.get("/api/auth/users");
};

// Update user
export const updateUserApi = (id, userData) => {
  return axios.put(`/api/auth/users/${id}`, {
    email: userData.email,
    name: userData.name,
    phoneNumber: userData.phoneNumber,
    role: userData.role,
    serviceCenterId: parseInt(userData.serviceCenterId),
    status: userData.status,
  });
};
//change pass
export const changePasswordApi = async (passwordData) => {
  return axios.post("/api/auth/change-password", {
    oldPassword: passwordData.oldPassword,
    newPassword: passwordData.newPassword,
  });
};

//forgot pass
export const forgotPasswordApi = async (email) => {
  return axios.post("/api/auth/forgot-password", {
    email: email,
  });
};

//toggle status
export const toggleUserStatusApi = (userId, isActive) => {
  const statusPath = isActive ? "active" : "inactive";
  return axios.put(`/api/auth/users/${statusPath}/${userId}`);
};

// // Delete user
// export const deleteUserApi = (id) => {
//   return axios.delete(`/api/auth/users/${id}`);
// };

// // Get user by ID
// export const getUserByIdApi = (id) => {
//   return axios.get(`/api/auth/users/${id}`);
// };

//get all SC
export const getServiceCentersApi = () => {
  return axios.get("/api/api/servicecenters");
};

//
//
export const createWarrantyClaimApi = (data) => {
  return axios.post("/api/api/claims", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
//{ Policy Warranty }

//get all policy
export const getAllWarrantyApi = () => {
  return axios.get("/api/api/policies");
};

// create policy
export const createWarrantyPolicyApi = (policyData) => {
  return axios.post("/api/api/policy", policyData);
};

// update policy
export const updateWarrantyPolicyApi = (id, policyData) => {
  return axios.put(`/api/api/policy/${id}`, policyData);
};

//  Delete policy
export const deleteWarrantyPolicyApi = (id) => {
  return axios.delete(`/api/api/policy/${id}`);
};

//{ Policy Parts }
export const getAllPartPoliciesApi = () => {
  return axios.get("/api/api/part-policies");
};

// detail part
export const getPartPolicyByIdApi = (policyId) => {
  return axios.get(`/api/api/part-policies/${policyId}`);
};

//add part policy
export const createPartPolicyApi = (partPolicyData) => {
  return axios.post("/api/api/part-policy", partPolicyData);
};

// Get available part codes and policy codes
export const getPartPolicyCodesApi = () => {
  return axios.get("/api/api/part-policy/code");
};

// { Part Policy Status }
export const updatePartPolicyStatusApi = (partPolicyId) => {
  return axios.put(`/api/api/part-policy/status/${partPolicyId}`);
};

// { vehicle storage API}
export const getVehicleDetailApi = (vehicleId) => {
  return axios.get(`/api/api/model/detail/${vehicleId}`);
};

// {Campaign API}

export const getAllCampaignsApi = () => {
  return axios.get("/api/api/campaigns");
};

export const createCampaignApi = (campaignData) => {
  return axios.post("/api/api/campaigns", campaignData);
};

// {Claim API}

// READ (Lấy tất cả claims)
export const getAllClaimsApi = async () => {
  return axios.get("/api/claims");
};

// READ (Lấy claim theo ID)
export const getClaimByIdApi = async (id) => {
  return axios.get(`/api/claims/${id}`);
};

// UPDATE (Cập nhật claim)
export const updateClaimApi = async (id, updatedData) => {
  return axios.put(`/api/claims/${id}`, updatedData);
};

// DELETE (Xóa claim)
export const deleteClaimApi = async (id) => {
  return axios.delete(`/api/claims/${id}`);
};

//  CREATE  claim
export const createClaimApi = async (
  vin,
  mileage,
  priority,
  partClaims,
  description,
  attachments
) => {
  const data = {
    vin,
    mileage,
    priority,
    partClaims,
    description,
    attachments,
  };

  return axios.post("/api/claims", data);
};

//{repairOrders API}

export const getAllRepairOrdersApi = () => {
  return axios.get("/api/api/repairOrders");
};

//get Vehicle Management
export const getAllModelsApi = () => {
  return axios.get("/api/api/models");
};

//get SupplyChain
export const getAllPartInventoriesApi = () => {
  return axios.get("/api/api/part-inventories");
};

export const getPartInventoryByServiceCenterIdApi = (serviceCenterId) => {
  return axios.get(`/api/api/part-inventory/service-center/${serviceCenterId}`);
};

// {Warranty Claims API}

export const updateWarrantyClaimApi = async (id, updatedData) => {
  return axios.put(`/api/claims/${id}`, updatedData);
};

export const getAllWarrantyClaimsApi = () => {
  return axios.get("/api/api/claims");
};

// Get all registered vehicles (Customer Registration page)
export const getAllVehiclesApi = () => {
  return axios.get("/api/api/vehicles");
};

export const createCustomerApi = (customerData) => {
  const URL_BACKEND = "/api/api/customers";
  const data = {
    name: customerData.name,
    phoneNumber: customerData.phoneNumber,
    licensePlate: customerData.licensePlate,
    email: customerData.email,
    address: customerData.address,
    vin: customerData.vin,
  };

  return axios.post(URL_BACKEND, data);
};

export const updateCampaignApi = (id, campaignData) => {
  return axios.put(`/api/api/campaigns/${id}`, {
    code: campaignData.code,
    name: campaignData.name,
    description: campaignData.description,
    startDate: campaignData.startDate,
    endDate: campaignData.endDate,
    produceDateFrom: campaignData.produceDateFrom,
    produceDateTo: campaignData.produceDateTo,
    affectedModels: campaignData.affectedModels,
    status: campaignData.status,
  });
};

//Reporting & Analytics API

// Get performance report (Service Center Performance)
export const getPerformanceReportApi = () => {
  return axios.get("/api/api/reports/performances");
};

// { Reports - Resolution Time Distribution }
export const getCompletedDurationReportApi = () => {
  return axios.get("/api/api/reports/completed-duration");
};

//{Get Customer by VIN}
export const getCustomerByVinApi = (vin) => {
  return axios.get(`/api/api/customer?vin=${vin}`);
};

export const searchVehiclesByPhoneApi = (phone) => {
  return axios.get(`/api/vehicle?phone=${phone}`);
};

export const getCampaignByVinApi = (vin) => {
  return axios.get(`/api/api/campaign?vin=${vin}`);
};
