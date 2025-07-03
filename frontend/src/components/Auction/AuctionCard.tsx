import React from 'react';
import { Clock, MapPin, Shield, Heart, Eye } from 'lucide-react';
import { AuctionItem } from '../../types';
import { formatCurrency, formatTimeLeft } from '../../utils/format';

interface AuctionCardProps {
  auction: AuctionItem;
  onView: (auction: AuctionItem) => void;
  onFavorite?: (auctionId: string) => void;
  isFavorite?: boolean;
  showWatchlist?: boolean;
}

export default function AuctionCard({ 
  auction, 
  onView, 
  onFavorite, 
  isFavorite = false,
  showWatchlist = true 
}: AuctionCardProps) {
  const timeLeft = formatTimeLeft(auction.endTime);
  const isEnding = auction.endTime.getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-w-16 aspect-h-12 bg-gray-200">
        <img
          src={auction.images[0]}
          alt={auction.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {auction.isReserved && (
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
              <Shield className="w-3 h-3 inline mr-1" />
              Reserved
            </span>
          )}
          {isEnding && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
              <Clock className="w-3 h-3 inline mr-1" />
              Ending Soon
            </span>
          )}
        </div>

        {/* Watchlist button */}
        {showWatchlist && onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(auction.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
          >
            <Heart 
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>
        )}

        {/* Time left overlay */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-medium">
          {timeLeft}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {auction.title}
          </h3>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          {auction.location}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Current Bid</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(auction.currentBid)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{auction.bids.length} bids</p>
            <div className="flex items-center mt-1">
              <img
                src={auction.seller.avatar || '/default-avatar.png'}
                alt={auction.seller.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm text-gray-600">{auction.seller.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Min bid: {formatCurrency(auction.currentBid + auction.minBidIncrement)}
            </span>
          </div>
          <button
            onClick={() => onView(auction)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>View & Bid</span>
          </button>
        </div>

        {/* Shipping info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {auction.shipping.free ? 'Free shipping' : `Shipping: ${formatCurrency(auction.shipping.cost || 0)}`}
            </span>
            <span className="text-gray-500 capitalize">
              {auction.condition}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}