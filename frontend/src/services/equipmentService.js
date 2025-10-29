import api from "./api";

export const getEquipments = async () => {
  const response = await api.get("/equipements");
  return response.data;
};

export const addEquipment = async (equipment) => {
  const response = await api.post("/equipements", equipment);
  return response.data;
};

export const updateEquipment = async (id, equipment) => {
  const response = await api.put(`/equipements/${id}`, equipment);
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await api.delete(`/equipements/${id}`);
  return response.data;
};
