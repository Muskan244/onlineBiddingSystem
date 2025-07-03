import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Shield, Heart, User, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { AuctionItem } from '../../types';
import { formatCurrency, formatTimeLeft, formatDate } from '../../utils/format';
import { useApp } from '../../context/AppContext';
import Modal from '../Common/Modal';
import Toast from '../Common/Toast';

interface AuctionDetailProps {
  auction: AuctionItem;
  onClose?: () => void;
}

export default function AuctionDetail({ auction, onClose }: AuctionDetailProps) {
  const { auth, placeBid } = useApp();
  const [bidAmount, setBidAmount] = useState(auction.currentBid + auction.minBidIncrement);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(auction.endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime]);

  const isAuctionEnded = auction.endTime.getTime() <= Date.now();
  const isOwner = String(auth.user?.id) === String(auction.sellerId);
  const canBid = auth.isAuthenticated && !isOwner && !isAuctionEnded;
  const minBid = auction.currentBid + auction.minBidIncrement;
  const isReserveMet = !auction.isReserved || (auction.reservePrice && auction.currentBid >= auction.reservePrice);

  const handlePlaceBid = async () => {
    if (bidAmount <= auction.currentBid) {
      setToast({ type: 'error', message: 'Bid amount must be higher than current bid' });
      return;
    }

    const success = await placeBid(auction.id, bidAmount);
    if (success) {
      setToast({ type: 'success', message: 'Bid placed successfully!' });
      setShowBidModal(false);
      setBidAmount(bidAmount + auction.minBidIncrement);
    } else {
      setToast({ type: 'error', message: 'Failed to place bid. Please try again.' });
    }
  };

  const isEnding = auction.endTime.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={auction.images[selectedImageIndex]}
              alt={auction.title}
              className="w-full h-96 object-cover"
            />
          </div>
          {auction.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {auction.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-md overflow-hidden ${
                    selectedImageIndex === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img src={image} alt={`${auction.title} ${index + 1}`} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auction Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {auction.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {timeLeft}
              </div>
              {auction.isReserved && (
                <div className="flex items-center text-amber-600">
                  <Shield className="w-4 h-4 mr-1" />
                  Reserved
                </div>
              )}
              {isEnding && !isAuctionEnded && (
                <div className="flex items-center text-red-600 animate-pulse">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Ending Soon
                </div>
              )}
            </div>
          </div>

          {/* Current Bid */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Bid</p>
                <p className="text-4xl font-bold text-primary-600">{formatCurrency(auction.currentBid)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next Bid (min)</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(minBid)}</p>
              </div>
            </div>

            {!isReserveMet && auction.isReserved && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-800">Reserve price has not been met</span>
                </div>
              </div>
            )}
          </div>

          {/* Bidding Actions */}
          {canBid && (
            <div className="space-y-4">
              <button
                onClick={() => setShowBidModal(true)}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Place Bid
              </button>
              <p className="text-sm text-gray-500 text-center">
                By bidding, you agree to our terms and conditions
              </p>
            </div>
          )}

          {isOwner && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">This is your auction</span>
              </div>
            </div>
          )}

          {isAuctionEnded && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-800">This auction has ended</span>
              </div>
            </div>
          )}

          {/* Seller Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
            <div className="flex items-center space-x-4">
              <img
                src={auction.seller.avatar || '/default-avatar.png'}
                alt={auction.seller.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-medium">{auction.seller.name}</h4>
                  {auction.seller.isVerified && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {auction.seller.rating.toFixed(1)} ({auction.seller.totalSales} sales)
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Member since {auction.seller.joinedAt.getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Auction Details */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Auction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Condition:</span>
                <span className="ml-2 capitalize font-medium">{auction.condition}</span>
              </div>
              <div>
                <span className="text-gray-600">Starting Price:</span>
                <span className="ml-2 font-medium">{formatCurrency(auction.startingPrice)}</span>
              </div>
              <div>
                <span className="text-gray-600">Started:</span>
                <span className="ml-2 font-medium">{formatDate(auction.startTime)}</span>
              </div>
              <div>
                <span className="text-gray-600">Ends:</span>
                <span className="ml-2 font-medium">{formatDate(auction.endTime)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Shipping & Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">
                  {auction.shipping.free ? 'Free' : formatCurrency(auction.shipping.cost || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">International Shipping:</span>
                <span className="font-medium">
                  {auction.shipping.international ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Description</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>
        </div>
      </div>

      {/* Bid History */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Bid History</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {auction.bids.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No bids yet. Be the first to bid!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {auction.bids
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((bid) => (
                  <div key={bid.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={bid.bidder.avatar || '/default-avatar.png'}
                        alt={bid.bidder.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{bid.bidder.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(bid.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">
                        {formatCurrency(bid.amount)}
                      </p>
                      {bid.isWinning && (
                        <p className="text-sm text-green-600 font-medium">Winning bid</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Place Your Bid"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">{auction.title}</h3>
            <p className="text-sm text-gray-600">Current bid: {formatCurrency(auction.currentBid)}</p>
          </div>

          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Your Bid Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={minBid}
                step={auction.minBidIncrement}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Minimum bid: {formatCurrency(minBid)}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowBidModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBid}
              disabled={bidAmount <= auction.currentBid}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Place Bid
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}