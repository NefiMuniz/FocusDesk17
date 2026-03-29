import api from "./axios";

export const getLists = (boardId: string) => api.get(`/boards/${boardId}/lists/`);
export const createList = (boardId: string, name: string) => 
  api.post(`/boards/${boardId}/lists/`, { name });
export const updateList = (listId: string, data: { name?: string; position?: number }) => 
  api.patch(`/lists/${listId}`, data);
export const deleteList = (listId: string) => api.delete(`/lists/${listId}`);