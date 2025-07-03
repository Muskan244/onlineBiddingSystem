import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Trophy, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatTimeLeft, formatDate } from '../utils/format';
import { getBidsByUserId } from '../api/bids';

interface MyBidsPageProps {
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function MyBidsPage({ onPageChange }: MyBidsPageProps) {
  const { auth, app } = useApp();
  const [selectedTab, setSelectedTab] = useState<'active' | 'won' | 'lost'>('active');
  const [userBids, setUserBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your bids.</p>
          <button
            onClick={() => onPageChange('login')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Fetch user bids from backend
  useEffect(() => {
    const fetchUserBids = async () => {
      setLoading(true);
      try {
        const bids = await getBidsByUserId(Number(auth.user!.id));
        setUserBids(bids);
      } catch (e) {
        setUserBids([]);
      }
      setLoading(false);
    };
    if (auth.user) fetchUserBids();
  }, [auth.user]);

  // Tab logic for bids
  const now = Date.now();
  const activeBids = userBids.filter((bid: any) => bid.item && !bid.item.auctionEnded && new Date(bid.item.biddingEndTime).getTime() > now);
  const wonBids = userBids.filter((bid: any) => {
    if (!bid.item) return false;
    if (bid.item.auctionEnded || new Date(bid.item.biddingEndTime).getTime() <= now) {
      // Assume the highest bid wins
      // If there are multiple bids for the same item, only count the highest one
      // For simplicity, just check if this bid is the highest for this item
      const highest = Math.max(...userBids.filter((b: any) => b.item && b.item.id === bid.item.id).map((b: any) => b.amount));
      return bid.amount === highest && bid.bidder && bid.bidder.id === auth.user!.id;
    }
    return false;
  });
  const lostBids = userBids.filter((bid: any) => {
    if (!bid.item) return false;
    if (bid.item.auctionEnded || new Date(bid.item.biddingEndTime).getTime() <= now) {
      const highest = Math.max(...userBids.filter((b: any) => b.item && b.item.id === bid.item.id).map((b: any) => b.amount));
      return bid.amount < highest && bid.bidder && bid.bidder.id === auth.user!.id;
    }
    return false;
  });

  const renderBidCard = (bid: any) => {
    const auction = bid.item;
    if (!auction) return null;
    const isEnded = auction.auctionEnded || new Date(auction.biddingEndTime).getTime() <= now;
    // For simplicity, assume the highest bid for this item is the winning bid
    const allBidsForItem = userBids.filter((b: any) => b.item && b.item.id === auction.id);
    const highest = Math.max(...allBidsForItem.map((b: any) => b.amount));
    const isUserWinning = bid.amount === highest;
    return (
      <div key={bid.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <img
            src={auction.imageUrl}
            alt={auction.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">{auction.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{auction.description}</p>
              </div>
              <button
                onClick={() => onPageChange('auction-detail', auction.id.toString())}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Your Bid</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(bid.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Bid</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(auction.currentPrice)}</p>
              </div>
              {!isEnded && (
                <div>
                  <p className="text-xs text-gray-500">Time Left</p>
                  <p className="text-sm font-medium text-gray-900">{formatTimeLeft(new Date(auction.biddingEndTime))}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isEnded ? (
                  isUserWinning ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-medium">Won</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Lost</span>
                    </div>
                  )
                ) : isUserWinning ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Winning</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-amber-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Outbid</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Bid placed {formatDate(bid.bidTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'active', label: 'Active Bids', count: activeBids.length },
    { id: 'won', label: 'Won', count: wonBids.length },
    { id: 'lost', label: 'Lost', count: lostBids.length },
  ];

  const getCurrentBids = () => {
    switch (selectedTab) {
      case 'active':
        return activeBids;
      case 'won':
        return wonBids;
      case 'lost':
        return lostBids;
      default:
        return activeBids;
    }
  };

  const currentBids = getCurrentBids();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading your bids...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bids</h1>
          <p className="text-gray-600">Track all your bidding activity</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 text-xs bg-gray-100 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {currentBids.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              {selectedTab === 'active' && <Clock className="w-full h-full" />}
              {selectedTab === 'won' && <Trophy className="w-full h-full" />}
              {selectedTab === 'lost' && <AlertCircle className="w-full h-full" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab === 'active' && 'No Active Bids'}
              {selectedTab === 'won' && 'No Won Auctions'}
              {selectedTab === 'lost' && 'No Lost Auctions'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'active' && "You haven't placed any bids on active auctions yet."}
              {selectedTab === 'won' && "You haven't won any auctions yet."}
              {selectedTab === 'lost' && "You haven't lost any auctions yet."}
            </p>
            <button
              onClick={() => onPageChange('browse')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Auctions
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {currentBids.map(renderBidCard)}
          </div>
        )}
      </div>
    </div>
  );
}