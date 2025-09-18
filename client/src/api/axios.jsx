import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-sih-project-l67a.onrender.com/api", // backend base url
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
