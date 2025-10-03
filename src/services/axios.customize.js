import axios from "axios";

//set config default when creating the instance
const instance = axios.create({
  baseURL: "",
});

//Alter defaults after instance has been created
// instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

export default instance;
