import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/Config';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const msg = error.response?.data?.error || error.message || 'Unbekannter Fehler';
    return Promise.reject(new Error(msg));
  }
);

// AUTH
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/auth/change-password', { currentPassword, newPassword }).then(r => r.data);

// CHARACTERS
export const getCharacters = () => api.get('/characters').then(r => r.data);
export const getCharacter = (id: string) => api.get(`/characters/${id}`).then(r => r.data);
export const createCharacter = (data: any) => api.post('/characters', data).then(r => r.data);
export const updateCharacter = (id: string, data: any) => api.put(`/characters/${id}`, data).then(r => r.data);
export const deleteCharacter = (id: string) => api.delete(`/characters/${id}`).then(r => r.data);
export const uploadCharacterImage = (characterId: string, imageUri: string, viewType: string) => {
  const formData = new FormData();
  formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' } as any);
  formData.append('view_type', viewType);
  return api.post(`/characters/${characterId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};
export const deleteCharacterImage = (characterId: string, imageId: string) =>
  api.delete(`/characters/${characterId}/images/${imageId}`).then(r => r.data);

// STORIES
export const getStories = () => api.get('/stories').then(r => r.data);
export const getStory = (id: string) => api.get(`/stories/${id}`).then(r => r.data);
export const createStory = (data: any) => api.post('/stories', data).then(r => r.data);
export const updateStory = (id: string, data: any) => api.put(`/stories/${id}`, data).then(r => r.data);
export const deleteStory = (id: string) => api.delete(`/stories/${id}`).then(r => r.data);
export const generateScenes = (id: string, data: any) => api.post(`/stories/${id}/generate-scenes`, data).then(r => r.data);
export const updateScene = (storyId: string, sceneId: string, data: any) =>
  api.put(`/stories/${storyId}/scenes/${sceneId}`, data).then(r => r.data);

// VIDEOS
export const getVideos = () => api.get('/videos').then(r => r.data);
export const generateVideo = (data: any) => api.post('/videos/generate', data).then(r => r.data);
export const getVideoStatus = (jobId: string) => api.get(`/videos/${jobId}/status`).then(r => r.data);
export const estimateCost = (data: any) => api.post('/videos/estimate', data).then(r => r.data);
export const deleteVideo = (jobId: string) => api.delete(`/videos/${jobId}`).then(r => r.data);

// IMAGES
export const generateImage = (data: any) => api.post('/images/generate', data).then(r => r.data);

// COINS
export const getCoinBalance = () => api.get('/coins/balance').then(r => r.data);
export const getCoinHistory = () => api.get('/coins/history').then(r => r.data);

// ADMIN
export const adminGetUsers = () => api.get('/admin/users').then(r => r.data);
export const adminCreateUser = (data: any) => api.post('/admin/users', data).then(r => r.data);
export const adminAddCoins = (userId: string, amount: number, description?: string) =>
  api.post('/admin/coins/add', { userId, amount, description }).then(r => r.data);
export const adminRemoveCoins = (userId: string, amount: number, description?: string) =>
  api.post('/admin/coins/remove', { userId, amount, description }).then(r => r.data);
export const adminResetPassword = (userId: string, newPassword: string) =>
  api.put(`/admin/users/${userId}/reset-password`, { newPassword }).then(r => r.data);
export const adminDeleteUser = (userId: string) => api.delete(`/admin/users/${userId}`).then(r => r.data);
export const adminGetStats = () => api.get('/admin/stats').then(r => r.data);

export default api;
