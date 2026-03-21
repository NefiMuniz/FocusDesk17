import axios from "axios";

//connection to the backend
const api = axios.create({
  baseURL: "http://localhost:8000/api", 
});

export default api;