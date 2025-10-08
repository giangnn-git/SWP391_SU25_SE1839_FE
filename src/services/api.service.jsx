import axios from "./axios.customize";

// Login API
export const userLoginApi = (user, password) => {
  const URL_BACKEND = "/api/auth/token";
  const data = { user, password };

  return axios.post(URL_BACKEND, data);
};

// Create User API
export const createUserApi = async (
  email,
  name,
  password,
  phoneNumber,
  role
) => {
  const URL_BACKEND = "/api/auth/user";

  const data = {
    email: email,
    name: name,
    password: password,
    phoneNumber: phoneNumber,
    role: role,
    serviceCenterId: 1,
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

// Inactive/Active user (toggle status)
export const toggleUserStatusApi = (id, isActive) => {
  return axios.patch(`/api/auth/users/${id}/status`, {
    isActive,
  });
};

// Delete user
export const deleteUserApi = (id) => {
  return axios.delete(`/api/auth/users/${id}`);
};

// Get user by ID
export const getUserByIdApi = (id) => {
  return axios.get(`/api/auth/users/${id}`);
};

export const getServiceCentersApi = () => {
  return axios.get("/api/api/servicecenters");
};

export const changePasswordApi = async (id, passwordData) => {
  const URL_BACKEND = `/api/auth/${id}/change-password`;

  return axios.post(URL_BACKEND, {
    oldPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
  });
};
