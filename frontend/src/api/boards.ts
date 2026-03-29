import api from "./axios";

export const getBoards = () => api.get("/boards");
export const createBoard = (name: string, description?: string) => 
  api.post("/boards", { name, description });
export const getBoard = (id: string) => api.get(`/boards/${id}`);
export const updateBoard = (id: string, data: { name?: string; description?: string }) => 
  api.patch(`/boards/${id}`, data);
export const deleteBoard = (id: string) => api.delete(`/boards/${id}`);