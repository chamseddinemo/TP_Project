import api from "./api";

export const getPurchases = async () => {
  const response = await api.get("/achat");
  return response.data;
};

export const addPurchase = async (purchase) => {
  const response = await api.post("/achat", purchase);
  return response.data;
};

export const updatePurchase = async (id, purchase) => {
  const response = await api.put(`/achat/${id}`, purchase);
  return response.data;
};

export const deletePurchase = async (id) => {
  const response = await api.delete(`/achat/${id}`);
  return response.data;
};
