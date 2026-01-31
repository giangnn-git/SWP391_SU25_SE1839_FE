// src/services/api.service.jsx
import axios from "./axios.customize";
//Login
export const userLoginApi = (username, password, loginType = "ADMIN") => {
    return axios.post("/api/v1/auth/login", {
        username,
        password,
        loginType,
    });
};

export const userLogoutApi = () => {
    // BE đọc token từ Authorization header
    return axios.post("/api/v1/auth/logout");
};
