import API from "./axiosInstance";
import { toFileUri } from "../utils/filePath";

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
  const response = await API.post(`/songs/${id}/generate`, payload);
  return response.data;
};

// Free regeneration during drafting (capped server-side) — song audio only, no token cost.
export const tweakSongAudio = async (id, payload) => {
  const response = await API.post(`/songs/${id}/tweak`, payload);
  return response.data;
};

// Locks the song — no more tweaks or regeneration afterward. Irreversible.
export const finalizeSong = async (id) => {
  const response = await API.post(`/songs/${id}/finalize`);
  return response.data;
};

export const uploadSongImage = async (id, formData) => {
  const response = await API.post(`/songs/${id}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const generateSongImage = async (id, payload) => {
  const response = await API.post(`/songs/${id}/generate-image`, payload);
  return response.data;
};

export const createReel = async (id, payload) => {
  const response = await API.post(`/songs/${id}/reel`, payload);
  return response.data;
};

export const getLeaderboard = async (limit = 50) => {
  const response = await API.get(`/leaderboard?limit=${limit}`);
  return response.data;
};

// Uploads a short voice recording and returns { text, language, durationSeconds,
// wordsPerMinute, suggestedBpm }. The server deletes the audio right after transcribing.
export const transcribeVoice = async (fileUri, language, signal) => {
  const uri = toFileUri(fileUri);
  const ext = (uri.split('.').pop() || 'm4a').toLowerCase();
  const formData = new FormData();
  formData.append('audio', { uri, name: `voice.${ext}`, type: ext === 'mp3' ? 'audio/mpeg' : 'audio/mp4' });
  if (language) formData.append('language', language);

  const response = await API.post('/songs/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
    signal, // lets the user cancel a slow upload
  });
  return response.data?.data ?? response.data;
};
