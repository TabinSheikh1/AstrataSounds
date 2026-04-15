import API from "./axiosInstance";

export const getMySongs = async () => {
  const response = await API.get("/songs/my");
  return response.data;
};

export const getAllSongs = async () => {
  const response = await API.get("/songs");
  return response.data;
};

export const getSongById = async (id) => {
  const response = await API.get(`/songs/${id}`);
  return response.data;
};

export const createSong = async (payload) => {
  const response = await API.post("/songs", payload);
  return response.data;
};

export const updateSong = async (id, payload) => {
  const response = await API.patch(`/songs/${id}`, payload);
  return response.data;
};

export const deleteSong = async (id) => {
  await API.delete(`/songs/${id}`);
};

export const toggleLikeSong = async (id) => {
  const response = await API.post(`/songs/${id}/like`);
  return response.data;
};

export const listenSong = async (id) => {
  const response = await API.post(`/songs/${id}/listen`);
  return response.data;
};

export const generateSongAudio = async (id, payload) => {
  const response = await API.post(`/songs/${id}/generate`, payload, {
    timeout: 1200000, // 20 minutes — AI audio generation
  });
  return response.data;
};

export const uploadSongImage = async (id, formData) => {
  const response = await API.post(`/songs/${id}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const generateSongImage = async (id, payload) => {
  const response = await API.post(`/songs/${id}/generate-image`, payload, {
    timeout: 1200000, // 20 minutes — AI image generation
  });
  return response.data;
};

export const getLeaderboard = async (limit = 50) => {
  const response = await API.get(`/leaderboard?limit=${limit}`);
  return response.data;
};
