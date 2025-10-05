import axios from "./axios.customize";
import { storage } from "../utils/storage";

// Login API
export const userLoginApi = (user, password) => {
  const URL_BACKEND = "/api/auth/token";
  const data = { user, password };

  return axios.post(URL_BACKEND, data);
};

// Create User API
export const createUserApi = async (name, password, role) => {
  const URL_BACKEND = "/api/auth/users";

  const token = storage.get("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  return axios.post(URL_BACKEND, { name, password, role }, config);
};

// Get all users
export const getAllUsersApi = () => {
  return axios.get("/api/auth/users");
};

// Update user
export const updateUserApi = (userId, userData) => {
  return axios.put(`/api/auth/users/${userId}`, userData);
};

// Inactive/Active user (toggle status)
export const toggleUserStatusApi = (userId, isActive) => {
  return axios.patch(`/api/auth/users/${userId}/status`, {
    isActive,
  });
};

// Delete user
export const deleteUserApi = (userId) => {
  return axios.delete(`/api/auth/users/${userId}`);
};

// Get user by ID
export const getUserByIdApi = (userId) => {
  return axios.get(`/api/auth/users/${userId}`);
};
