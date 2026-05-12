import API from './axiosInstance';

export const updateProfile = (payload) => API.patch('/users/me', payload);

export const uploadProfilePicture = (formData) =>
  API.post('/users/me/upload-profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getUserPublicProfile = (userId) => API.get(`/users/${userId}/profile`);
