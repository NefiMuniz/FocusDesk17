import api from "./axios";

export const login = (email: string, password: string) => {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);
  return api.post("/auth/login", formData);
};

export const registerUser = (name: string, email: string, password: string) =>
  api.post("/auth/register", { email, name, password });

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
};