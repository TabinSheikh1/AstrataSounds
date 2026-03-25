import API from "./axiosInstance";

export const getMyVibes = async () => {
  const response = await API.get("/vibes/my");
  return response.data;
};

export const getVibeById = async (id) => {
  const response = await API.get(`/vibes/${id}`);
  return response.data;
};

export const createVibe = async (payload) => {
  const response = await API.post("/vibes", payload);
  return response.data;
};

export const updateVibe = async (id, payload) => {
  const response = await API.patch(`/vibes/${id}`, payload);
  return response.data;
};

export const deleteVibe = async (id) => {
  await API.delete(`/vibes/${id}`);
};
