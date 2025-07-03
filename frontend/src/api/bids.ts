import API from './index';

// Place a bid
export async function placeBid(itemId: number, userId: number, amount: number) {
  const response = await API.post('/bids/place', { itemId, userId, amount });
  return response.data;
}

// Get all bids for an item
export async function getBidsByItemId(itemId: number) {
  const response = await API.get(`/bids/item/${itemId}`);
  return response.data;
}

// Get all bids by a user
export async function getBidsByUserId(userId: number) {
  const response = await API.get(`/bids/user/${userId}`);
  return response.data;
}

// Get a bid by its ID
export async function getBidById(bidId: number) {
  const response = await API.get(`/bids/${bidId}`);
  return response.data;
} 