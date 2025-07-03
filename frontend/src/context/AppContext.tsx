import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AppState, User, AuctionItem, Notification, Bid } from '../types';
import { mockUsers } from '../data/mockData';
import API from '../api';
import { fetchAllItems, createItem, editItem, deleteItem } from '../api/items';
import { placeBid as apiPlaceBid } from '../api/bids';
import { fetchNotifications, markNotificationRead as apiMarkNotificationRead, markAllNotificationsRead as apiMarkAllNotificationsRead } from '../api/notifications';

interface AppContextType {
  auth: AuthState;
  app: AppState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { name: string; username: string; email: string; password: string }) => Promise<boolean>;
  placeBid: (auctionId: string, amount: number) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => void;
  updateSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<AppState>) => void;
  createAuction: (auction: Partial<AuctionItem>) => Promise<boolean>;
  updateAuction: (auctionId: string, updates: Partial<AuctionItem>) => boolean;
  deleteAuction: (auctionId: string) => Promise<boolean>;
  editAuction: (id: string, auctionData: any) => Promise<boolean>;
  markAllNotificationsRead: () => void;
  deleteNotification: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction = 
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUCTIONS'; payload: AuctionItem[] }
  | { type: 'PLACE_BID'; payload: { auctionId: string; amount: number; bidder: User } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_SEARCH'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<AppState> }
  | { type: 'ADD_AUCTION'; payload: AuctionItem }
  | { type: 'UPDATE_AUCTION'; payload: { auctionId: string; updates: Partial<AuctionItem> } }
  | { type: 'DELETE_AUCTION'; payload: string }
  | { type: 'CHECK_AUCTION_ENDINGS' }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

const initialState: { auth: AuthState; app: AppState } = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  },
  app: {
    auctions: [] as AuctionItem[],
    notifications: [] as Notification[],
    searchQuery: '',
    selectedCategory: 'all',
    priceRange: [0, 10000] as [number, number],
    sortBy: 'ending_soon' as const,
  },
};

function appReducer(
  state: { auth: AuthState; app: AppState }, 
  action: AppAction
): { auth: AuthState; app: AppState } {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
          isLoading: false,
        },
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: action.payload,
        },
      };
    case 'SET_AUCTIONS':
      return {
        ...state,
        app: {
          ...state.app,
          auctions: action.payload,
        },
      };
    case 'PLACE_BID': {
      if (!action.payload.bidder) return state;
      return {
        ...state,
        app: {
          ...state.app,
          auctions: state.app.auctions.map(auction => {
            if (auction.id === action.payload.auctionId) {
              const newBid: Bid = {
                id: Date.now().toString(),
                amount: action.payload.amount,
                bidderId: action.payload.bidder.id,
                bidder: action.payload.bidder,
                timestamp: new Date(),
                isWinning: true,
              };
              return {
                ...auction,
                currentBid: action.payload.amount,
                bids: [...auction.bids.map(bid => ({ ...bid, isWinning: false })), newBid],
              };
            }
            return auction;
          }),
        },
      };
    }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        app: {
          ...state.app,
          notifications: [action.payload, ...state.app.notifications],
        },
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        app: {
          ...state.app,
          notifications: state.app.notifications.map(notification =>
            notification.id === action.payload
              ? { ...notification, read: true }
              : notification
          ),
        },
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        app: {
          ...state.app,
          notifications: state.app.notifications.map(notification => ({
            ...notification,
            read: true,
          })),
        },
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        app: {
          ...state.app,
          notifications: state.app.notifications.filter(
            notification => notification.id !== action.payload
          ),
        },
      };
    case 'UPDATE_SEARCH':
      return {
        ...state,
        app: {
          ...state.app,
          searchQuery: action.payload,
        },
      };
    case 'UPDATE_FILTERS':
      return {
        ...state,
        app: {
          ...state.app,
          ...action.payload,
        },
      };
    case 'ADD_AUCTION':
      return {
        ...state,
        app: {
          ...state.app,
          auctions: [action.payload, ...state.app.auctions],
        },
      };
      case 'UPDATE_AUCTION':
      return {
        ...state,
        app: {
          ...state.app,
          auctions: state.app.auctions.map(auction =>
            auction.id === action.payload.auctionId
              ? { ...auction, ...action.payload.updates }
              : auction
          ),
        },
      };
    case 'DELETE_AUCTION':
      return {
        ...state,
        app: {
          ...state.app,
          auctions: state.app.auctions.filter(auction => auction.id !== action.payload),
        },
      };
    case 'CHECK_AUCTION_ENDINGS':
      const now = new Date();
      const endingNotifications: Notification[] = [];
      
      const auctionsToUpdate = state.app.auctions.map(auction => {
        const wasActive = auction.status === 'active' && auction.endTime.getTime() > now.getTime() - 60000; // 1 minute ago
        const isNowEnded = auction.endTime.getTime() <= now.getTime();
        
        if (wasActive && isNowEnded && auction.status === 'active') {
          // Auction just ended
          const winningBid = auction.bids.sort((a, b) => b.amount - a.amount)[0];
          
          if (winningBid) {
            // Notify winner
            endingNotifications.push({
              id: `won-${auction.id}-${Date.now()}`,
              userId: winningBid.bidderId,
              type: 'auction_won',
              title: 'Congratulations! You won an auction!',
              message: `You won "${auction.title}" with a bid of $${winningBid.amount}`,
              timestamp: new Date(),
              read: false,
              actionUrl: `/auction/${auction.id}`,
            });
            
            // Notify seller
            endingNotifications.push({
              id: `sold-${auction.id}-${Date.now()}`,
              userId: auction.sellerId,
              type: 'auction_ended',
              title: 'Your auction has ended!',
              message: `"${auction.title}" sold for $${winningBid.amount} to ${winningBid.bidder.name}`,
              timestamp: new Date(),
              read: false,
              actionUrl: `/auction/${auction.id}`,
            });
          } else {
            // Notify seller of no sale
            endingNotifications.push({
              id: `unsold-${auction.id}-${Date.now()}`,
              userId: auction.sellerId,
              type: 'auction_ended',
              title: 'Your auction has ended',
              message: `"${auction.title}" ended without any bids`,
              timestamp: new Date(),
              read: false,
              actionUrl: `/auction/${auction.id}`,
            });
          }
          
          return { ...auction, status: 'ended' as const };
        }
        
        return auction;
      });
      return {
        ...state,
        app: {
          ...state.app,
          auctions: auctionsToUpdate,
          notifications: [...endingNotifications, ...state.app.notifications],
        },
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        app: {
          ...state.app,
          notifications: action.payload,
        },
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await fetchAllItems();
        dispatch({ type: 'SET_AUCTIONS', payload: items });
      } catch (error) {
        console.error("Failed to fetch items:", error);
        // Optionally set an error state here
      }
    };
    loadItems();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.clear();
      }
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (state.auth.user) {
        try {
          const userId = state.auth.user.id;
          const notifications = await fetchNotifications(Number(userId));
          // Map backend notification fields to frontend Notification type
          const mappedNotifications = notifications.map((n: any) => ({
            id: n.id?.toString() ?? Date.now().toString(),
            userId: n.userId?.toString() ?? userId,
            type: n.type || 'new_message',
            title: n.title || 'Notification',
            message: n.message || '',
            timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
            read: typeof n.read === 'boolean' ? n.read : !!n.read,
            actionUrl: n.actionUrl || '',
          }));
          // Sort notifications by timestamp descending
          mappedNotifications.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
          // Use reducer to set notifications
          dispatch({ type: 'SET_NOTIFICATIONS', payload: mappedNotifications });
        } catch (error) {
          // Optionally handle error
        }
      }
    };
    loadNotifications();
    // Only refetch when user changes
  }, [state.auth.user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.post(
        `/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      const { user, token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
    dispatch({ type: 'SET_LOADING', payload: false });
    return false;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (userData: { name: string; username: string; email: string; password: string }): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await API.post('/users/register', userData);
      dispatch({ type: 'SET_LOADING', payload: false });
    return true;
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const placeBid = async (auctionId: string, amount: number): Promise<boolean> => {
    const user = state.auth.user;
    if (!user) return false;
    const auction = state.app.auctions.find(a => a.id === auctionId);
    if (!auction || amount <= auction.currentBid) return false;
    try {
      await apiPlaceBid(Number(auctionId), Number(user.id), amount);
      // Refresh auctions after placing bid
      const updatedItems = await fetchAllItems();
      dispatch({ type: 'SET_AUCTIONS', payload: updatedItems });
    // Add notification
    const notification: Notification = {
      id: Date.now().toString(),
        userId: user.id,
      type: 'bid_placed',
      title: 'Bid Placed Successfully',
      message: `You placed a bid of $${amount} on ${auction.title}`,
      timestamp: new Date(),
      read: false,
      actionUrl: `/auction/${auctionId}`,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    return true;
    } catch (error) {
      console.error('Failed to place bid:', error);
      return false;
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    await apiMarkNotificationRead(Number(notificationId));
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const markAllNotificationsRead = async () => {
    if (state.auth.user) {
      await apiMarkAllNotificationsRead(Number(state.auth.user.id));
      // Optionally refetch notifications or mark all as read in state
      // For now, mark all as read in state
      state.app.notifications = state.app.notifications.map(n => ({ ...n, read: true }));
    }
  };

  const deleteNotification = (notificationId: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
  };

  const updateSearchQuery = (query: string) => {
    dispatch({ type: 'UPDATE_SEARCH', payload: query });
  };

  const updateFilters = (filters: Partial<AppState>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const createAuction = async (auctionData: Partial<AuctionItem>): Promise<boolean> => {
    if (!state.auth.user) {
      console.error("Cannot create auction: no authenticated user");
      return false;
    }

    // Map frontend AuctionItem to backend Item model
    const itemForBackend = {
      name: auctionData.title,
      description: auctionData.description,
      startingPrice: auctionData.startingPrice,
      biddingEndTime: auctionData.endTime,
      imageUrl: auctionData.images && auctionData.images.length > 0 ? auctionData.images[0] : null,
      // The backend will set the seller, currentPrice, and auctionEnded status
    };

    try {
      // Use the new createItem API function
      await createItem(itemForBackend);
      const updatedItems = await fetchAllItems();
      dispatch({ type: 'SET_AUCTIONS', payload: updatedItems });
      return true;
    } catch (error) {
      console.error("Failed to create auction:", error);
      return false;
    }
  };

  const updateAuction = (auctionId: string, updates: Partial<AuctionItem>): boolean => {
    if (!state.auth.user) return false;
    
    const auction = state.app.auctions.find(a => a.id === auctionId);
    if (!auction || auction.sellerId !== state.auth.user.id) return false;
    
    // Don't allow updates to ended auctions
    if (auction.endTime.getTime() <= Date.now()) return false;
    
    dispatch({
      type: 'UPDATE_AUCTION',
      payload: { auctionId, updates },
    });
    
    return true;
  };

  const deleteAuction = async (id: string): Promise<boolean> => {
    try {
      await deleteItem(id);
      const updatedItems = await fetchAllItems();
      dispatch({ type: 'SET_AUCTIONS', payload: updatedItems });
      return true;
    } catch (error) {
      console.error("Failed to delete auction:", error);
      return false;
    }
  };

  const editAuction = async (id: string, auctionData: any): Promise<boolean> => {
    try {
      await editItem(id, auctionData);
      const updatedItems = await fetchAllItems();
      dispatch({ type: 'SET_AUCTIONS', payload: updatedItems });
      return true;
    } catch (error) {
      console.error("Failed to edit auction:", error);
      return false;
    }
  };

  const contextValue: AppContextType = {
    auth: state.auth,
    app: state.app,
    login,
    logout,
    register,
    placeBid,
    markNotificationRead,
    deleteNotification,
    updateSearchQuery,
    updateFilters,
    createAuction,
    updateAuction,
    deleteAuction,
    editAuction,
    markAllNotificationsRead,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}