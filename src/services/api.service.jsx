import axios from "./axios.customize";

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

// // Inactive/Active user (toggle status)
// export const toggleUserStatusApi = (id, isActive) => {
//   return axios.patch(`/api/auth/users/${id}/status`, {
//     isActive,
//   });
// };

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

//change pass
export const changePasswordApi = async (id, passwordData) => {
  const URL_BACKEND = `/api/auth/${id}/change-password`;

  return axios.post(URL_BACKEND, {
    oldPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
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
