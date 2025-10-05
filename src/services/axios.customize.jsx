import axios from "axios";
import { storage } from "../utils/storage";

const instance = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Automatic add token
instance.interceptors.request.use(
  (config) => {
    const token = storage.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or time out
      storage.remove("token");
      storage.remove("userData");
      storage.remove("isLoggedIn");

      // redirect
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
