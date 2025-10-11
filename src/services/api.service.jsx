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

export const deactivateUserApi = (userId) => {
  return axios.patch(`/api/auth/users/inactive/${userId}`);
};

export const activateUserApi = (userId) => {
  return axios.patch(`/api/auth/users/active/${userId}`);
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
  return axios.get("/api/servicecenters");
};

//

// ✅ CREATE (Tạo claim)
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
    attachments
  };

  console.log("Create Claim Payload:", data);
  return axios.post("/api/claims", data);
};

//
export const createWarrantyClaimApi = (data) => {
  return axios.post("/api/api/claims", data, {
    // headers: {
    //   "Content-Type": "application/json",
    // },
  });
};

export const updateWarrantyClaimApi = async (id, updatedData) => {
  console.log("🛠 Updating claim:", id, updatedData);
  return axios.put(`/api/claims/${id}`, updatedData);
};

export const getAllWarrantyClaimsApi = () => {
  return axios.get("/api/api/claims");
};

//
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
  console.log("🛠 Updating claim:", id, updatedData);
  return axios.put(`/api/claims/${id}`, updatedData);
};

// DELETE (Xóa claim)
export const deleteClaimApi = async (id) => {
  console.log("🗑️ Deleting claim:", id);
  return axios.delete(`/api/claims/${id}`);
};
//   return axios.get("/api/api/servicecenters");
// };
// 
// export const changePasswordApi = async (id, passwordData) => {
//   const URL_BACKEND = `/api/auth/${id}/change-password`;
//change pass
export const changePasswordApi = async (passwordData) => {
  const URL_BACKEND = `/api/auth/change-password`;

  return axios.post(URL_BACKEND, {
    oldPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
  });
};

//forgot pass
export const forgotPasswordApi = async (email) => {
  return axios.post("/api/auth/forgot-password", {
    email: email,
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

export const getAllRepairOrdersApi = () => {
  return axios.get("/api/api/repairOrders");
};
