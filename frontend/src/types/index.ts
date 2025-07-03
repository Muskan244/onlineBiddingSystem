export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'bidder' | 'seller' | 'admin';
  avatar?: string;
  rating: number;
  totalBids: number;
  totalSales: number;
  joinedAt: Date;
  isVerified: boolean;
}

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  startingPrice: number;
  currentBid: number;
  minBidIncrement: number;
  startTime: Date;
  endTime: Date;
  sellerId: string;
  seller: User;
  bids: Bid[];
  status: 'active' | 'ended' | 'cancelled';
  isReserved: boolean;
  reservePrice?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  location: string;
  shipping: {
    free: boolean;
    cost?: number;
    international: boolean;
  };
}

export interface Bid {
  id: string;
  amount: number;
  bidderId: string;
  bidder: User;
  timestamp: Date;
  isWinning: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bid_placed' | 'outbid' | 'auction_won' | 'auction_ended' | 'new_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  auctions: AuctionItem[];
  notifications: Notification[];
  searchQuery: string;
  selectedCategory: string;
  priceRange: [number, number];
  sortBy: 'ending_soon' | 'price_low' | 'price_high' | 'newest' | 'popular';
}