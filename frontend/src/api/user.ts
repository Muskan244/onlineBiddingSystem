import API from './index';

export async function fetchUserProfile(id: string) {
  const response = await API.get(`/users/profile/${id}`);
  return response.data;
}

export async function updateUserProfile(id: string, updatedUser: { name: string; email: string }) {
  const response = await API.put(`/users/update/${id}`, updatedUser);
  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await API.post('/users/forgot-password', { email });
  return response.data;
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await API.post('/users/reset-password', { token, newPassword });
  return response.data;
} 