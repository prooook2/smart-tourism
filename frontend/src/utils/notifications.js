import axios from "axios";

const API_BASE = "http://localhost:5000/api/notifications";

export const sendEventNotification = async (eventId, payload, token) => {
  const res = await axios.post(`${API_BASE}/events/${eventId}/send`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchMyNotifications = async (token, limit = 50) => {
  const res = await axios.get(`${API_BASE}/me?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.notifications || [];
};
