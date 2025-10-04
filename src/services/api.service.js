import axios from "./axios.customize";

export const createUserApi = async (name, password, role) => {
  const URL_BACKEND = "";
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const data = { name, password, role };
  return axios.post(URL_BACKEND, data, config);
};

export const userLoginApi = () => {
  const URL_BACKEND = "/auth/token";
  const data = {
    user: email,
    password: password,
  };
  return axios.post(URL_BACKEND, data);
};
