import api from "./axios";

export const getLabels = () => api.get("/labels");
export const createLabel = (name: string, color?: string) => 
  api.post("/labels", { name, color });
export const updateLabel = (labelId: string, data: { name?: string; color?: string }) => 
  api.patch(`/labels/${labelId}`, data);
export const deleteLabel = (labelId: string) => api.delete(`/labels/${labelId}`);