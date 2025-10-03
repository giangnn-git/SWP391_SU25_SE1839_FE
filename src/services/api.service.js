import axios from "./axios.customize";

export const createUserApi = () => {
  const URL_BACKEND = "/auth/token";
  const data = {
    fullName: fullName,
    email: email,
    password: password,
    phone: phone,
  };
  return axios.post(URL_BACKEND, data);
};

export const userLoginApi = () => {
  const URL_BACKEND = "/auth/token";
  const data = {
    user: email,
    password: password,
  };
  return axios.post(URL_BACKEND, data);
};
