import API from "./axiosInstance";

export const getMyPlaylists = async () => {
  const response = await API.get("/playlists/my");
  return response.data;
};

export const createPlaylist = async (payload) => {
  const response = await API.post("/playlists", payload);
  return response.data;
};

export const updatePlaylist = async (id, payload) => {
  const response = await API.patch(`/playlists/${id}`, payload);
  return response.data;
};

export const deletePlaylist = async (id) => {
  await API.delete(`/playlists/${id}`);
};

export const addSongToPlaylist = async (id, songId) => {
  const response = await API.post(`/playlists/${id}/songs/${songId}`);
  return response.data;
};

export const removeSongFromPlaylist = async (id, songId) => {
  const response = await API.delete(`/playlists/${id}/songs/${songId}`);
  return response.data;
};

export const generatePlaylistBanner = async (id, payload) => {
  const response = await API.post(`/playlists/${id}/generate-banner`, payload, {
    timeout: 1200000, // 20 minutes — AI image generation
  });
  return response.data;
};

export const uploadPlaylistBanner = async (id, formData) => {
  const response = await API.post(`/playlists/${id}/upload-banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
