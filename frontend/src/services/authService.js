import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data; // { user, token }
};

export const signup = async (name, email, password, role) => {
  const response = await api.post("/auth/signup", { name, email, password, role });
  return response.data;
};
