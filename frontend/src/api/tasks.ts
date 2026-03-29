import api from "./axios";

export const getTasks = (listId: string) => api.get(`/lists/${listId}/tasks/`);
export const createTask = (listId: string, data: { title: string; description?: string; due_date?: string; status?: string }) => 
  api.post(`/lists/${listId}/tasks/`, data);
export const getTask = (taskId: string) => api.get(`/tasks/${taskId}`);
export const updateTask = (taskId: string, data: { title?: string; description?: string; due_date?: string; status?: string }) => 
  api.patch(`/tasks/${taskId}`, data);
export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`);
export const reorderTask = (taskId: string, newListId: string, newPosition: number) => 
  api.patch(`/tasks/${taskId}/reorder`, { new_list_id: newListId, new_position: newPosition });
export const addLabel = (taskId: string, labelId: string) => 
  api.post(`/tasks/${taskId}/labels/${labelId}`);
export const removeLabel = (taskId: string, labelId: string) => 
  api.delete(`/tasks/${taskId}/labels/${labelId}`);