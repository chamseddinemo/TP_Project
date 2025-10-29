import api from "./api";

export const getSales = async () => {
  const response = await api.get("/vente");
  return response.data;
};

export const addSale = async (sale) => {
  const response = await api.post("/vente", sale);
  return response.data;
};

export const updateSale = async (id, sale) => {
  const response = await api.put(`/vente/${id}`, sale);
  return response.data;
};

export const deleteSale = async (id) => {
  const response = await api.delete(`/vente/${id}`);
  return response.data;
};
