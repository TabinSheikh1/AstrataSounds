import API from "./axiosInstance";

export const getCurrentCompetition = async () => {
  const response = await API.get("/competitions/current");
  return response.data;
};

export const getCompetitionEntries = async (competitionId, { limit = 20, offset = 0 } = {}) => {
  const response = await API.get(`/competitions/${competitionId}/entries?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const getRoundResults = async (roundNumber, { limit = 20, offset = 0 } = {}) => {
  const response = await API.get(`/competitions/rounds/${roundNumber}?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const submitCompetitionEntry = async (songId) => {
  const response = await API.post("/competitions/current/entries", { songId });
  return response.data;
};

export const toggleCompetitionVote = async (entryId) => {
  const response = await API.post(`/competitions/entries/${entryId}/vote`);
  return response.data;
};
