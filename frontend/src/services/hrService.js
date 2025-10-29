import api from "./api";

export const getEmployees = async () => {
  const response = await api.get("/rh");
  return response.data;
};

export const addEmployee = async (employee) => {
  const response = await api.post("/rh", employee);
  return response.data;
};

export const updateEmployee = async (id, employee) => {
  const response = await api.put(`/rh/${id}`, employee);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/rh/${id}`);
  return response.data;
};
