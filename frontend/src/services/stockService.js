import api from "./api";

export const getProducts = async () => {
  const response = await api.get("/stock/products");
  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post("/stock/products", product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/stock/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/stock/products/${id}`);
  return response.data;
};
