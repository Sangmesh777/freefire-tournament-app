import axios from 'axios';
import { API_BASE_URL } from '../config';

// Change BASE_URL in src/config.js to point to your backend
const BASE_URL = API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiry - could emit event here
    }
    return Promise.reject(error);
  }
);

// Auth
export const sendOTP = (phone) => api.post('/auth/send-otp', { phone });
export const verifyOTP = (phone, otp) => api.post('/auth/verify-otp', { phone, otp });
export const getMe = () => api.get('/auth/me');
export const updateProfile = (formData) =>
  api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getUserProfile = (id) => api.get(`/auth/profile/${id}`);

// Tournaments
export const getTournaments = (status) =>
  api.get('/tournaments', { params: status ? { status } : {} });
export const getTournamentById = (id) => api.get(`/tournaments/${id}`);
export const createTournament = (data) => api.post('/tournaments', data);
export const updateTournament = (id, data) => api.put(`/tournaments/${id}`, data);
export const deleteTournament = (id) => api.delete(`/tournaments/${id}`);
export const registerForTournament = (tournamentId, teamId) =>
  api.post(`/tournaments/${tournamentId}/register`, { team_id: teamId });

// Teams
export const getTeams = () => api.get('/teams');
export const getTeamById = (id) => api.get(`/teams/${id}`);
export const createTeam = (formData) =>
  api.post('/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateTeam = (id, formData) =>
  api.put(`/teams/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const addTeamMember = (teamId, userId) =>
  api.post(`/teams/${teamId}/members`, { user_id: userId });
export const removeTeamMember = (teamId, userId) =>
  api.delete(`/teams/${teamId}/members/${userId}`);

// Matches
export const getMatches = (tournamentId) =>
  api.get('/matches', { params: tournamentId ? { tournament_id: tournamentId } : {} });
export const getMatchById = (id) => api.get(`/matches/${id}`);
export const createMatch = (data) => api.post('/matches', data);
export const updateMatch = (id, data) => api.put(`/matches/${id}`, data);
export const submitMatchResult = (id, data) => api.post(`/matches/${id}/result`, data);

// Leaderboard
export const getLeaderboard = (tournamentId) =>
  api.get('/leaderboard', { params: tournamentId ? { tournament_id: tournamentId } : {} });
export const recalculateLeaderboard = (tournamentId) =>
  api.post(`/leaderboard/recalculate/${tournamentId}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);

export default api;
