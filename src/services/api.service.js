import axios from "./axios.customize";

// export const createUserApi = async (name, password, role) => {
//   const URL_BACKEND = "/api/auth/users";
//   const token = localStorage.getItem("token");

//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const data = { name, password, role };
//   return axios.post(URL_BACKEND, data, config);
// };

// export const userLoginApi = (user, password) => {
//   const URL_BACKEND = "/api/auth/token";
//   const data = {
//     user: user,
//     password: password,
//   };
//   return axios.post(URL_BACKEND, data);
// };

// Login
export const userLoginApi = (user, password) => {
  const URL_BACKEND = "/api/auth/token"; // proxy sẽ chuyển tiếp
  const data = { user, password };
  return axios.post(URL_BACKEND, data);
};

// Create User
export const createUserApi = async (name, password, role) => {
  const URL_BACKEND = "/api/auth/users";
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  return axios.post(URL_BACKEND, { name, password, role }, config);
};
