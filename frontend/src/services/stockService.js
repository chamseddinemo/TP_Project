import api from "./api";

export const getProducts = async () => {
  const response = await api.get("/stock");
  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post("/stock", product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/stock/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/stock/${id}`);
  return response.data;
};
