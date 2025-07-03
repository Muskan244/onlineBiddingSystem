import API from './index';
import { AuctionItem, User } from '../types';

// Define a type for the raw item from the backend
interface BackendItem {
  id: number;
  name: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  biddingEndTime: string;
  imageUrl: string;
  auctionEnded: boolean;
  seller: User; // Assuming the backend sends the full seller object
  bids: any[]; // Assuming bids are sent, define more strictly if needed
}

export const fetchAllItems = async (): Promise<AuctionItem[]> => {
  const response = await API.get('/items');
  const backendItems: BackendItem[] = response.data;

  // Map backend items to frontend AuctionItem format
  return backendItems.map(item => ({
    id: item.id.toString(),
    title: item.name,
    description: item.description,
    images: item.imageUrl ? [item.imageUrl] : [],
    category: 'general', // Default value
    startingPrice: item.startingPrice,
    currentBid: item.currentPrice,
    minBidIncrement: 1, // Default value
    startTime: new Date(), // Default or map from backend if available
    endTime: new Date(item.biddingEndTime),
    sellerId: item.seller && item.seller.id ? item.seller.id.toString() : '',
    seller: item.seller ? item.seller : {
      id: '',
      name: 'Unknown',
      username: '',
      email: '',
      role: 'seller',
      avatar: '',
      rating: 0,
      totalBids: 0,
      totalSales: 0,
      joinedAt: new Date(),
      isVerified: false,
    },
    bids: item.bids || [],
    status: item.auctionEnded ? 'ended' : 'active',
    isReserved: false, // Default value
    condition: 'good', // Default value
    location: 'Online', // Default value
    shipping: { free: true, international: false }, // Default value
  }));
};

export const createItem = async (itemData: Partial<AuctionItem>) => {
  const response = await API.post('/item', itemData);
  return response.data; // Assuming this also returns a BackendItem
};

export const fetchItemById = async (id: string | number) => {
  const response = await API.get(`/item/${id}`);
  const item = response.data;
  let status: 'active' | 'ended' | 'cancelled' = 'active';
  if (item.auctionEnded === true) {
    status = 'ended';
  }
  // Ensure condition is one of the allowed values
  const allowedConditions = ['good', 'new', 'like-new', 'fair', 'poor'] as const;
  const condition: 'good' | 'new' | 'like-new' | 'fair' | 'poor' = allowedConditions.includes(item.condition) ? item.condition : 'good';
  return {
    id: item.id.toString(),
    title: item.name,
    description: item.description,
    images: item.imageUrl ? [item.imageUrl] : [],
    category: 'general',
    startingPrice: item.startingPrice,
    currentBid: item.currentPrice,
    minBidIncrement: 1,
    startTime: new Date(),
    endTime: new Date(item.biddingEndTime),
    sellerId: item.seller && item.seller.id ? item.seller.id.toString() : '',
    seller: item.seller ? {
      ...item.seller,
      rating: typeof item.seller.rating === 'number' ? item.seller.rating : 0,
      totalBids: typeof item.seller.totalBids === 'number' ? item.seller.totalBids : 0,
      totalSales: typeof item.seller.totalSales === 'number' ? item.seller.totalSales : 0,
      joinedAt: item.seller.joinedAt ? new Date(item.seller.joinedAt) : new Date(),
      isVerified: !!item.seller.isVerified,
    } : {
      id: '',
      name: 'Unknown',
      username: '',
      email: '',
      role: 'seller',
      avatar: '',
      rating: 0,
      totalBids: 0,
      totalSales: 0,
      joinedAt: new Date(),
      isVerified: false,
    },
    bids: item.bids || [],
    status,
    isReserved: false,
    condition,
    location: 'Online',
    shipping: { free: true, international: false },
  };
};

export const editItem = async (id: string | number, itemData: any) => {
  const response = await API.put(`/item/${id}`, itemData);
  return response.data;
};

export const deleteItem = async (id: string | number) => {
  const response = await API.delete(`/item/${id}`);
  return response.data;
}; 