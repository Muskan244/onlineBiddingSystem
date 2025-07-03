import API from './index';

export async function fetchNotifications(userId: number) {
  const response = await API.get(`/notifications?userId=${userId}`);
  return response.data;
}

export async function markNotificationRead(notificationId: number) {
  const response = await API.post(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsRead(userId: number) {
  const response = await API.post(`/notifications/read-all?userId=${userId}`);
  return response.data;
} 