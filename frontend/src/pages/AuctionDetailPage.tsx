import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuctionDetail from '../components/Auction/AuctionDetail';
import { fetchItemById } from '../api/items';
import { getBidsByItemId } from '../api/bids';
import { AuctionItem } from '../types'; // Adjust path if needed

interface AuctionDetailPageProps {
  auctionId: string | null;
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function AuctionDetailPage({ auctionId, onPageChange }: AuctionDetailPageProps) {
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionId) {
      setAuction(null);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      fetchItemById(auctionId),
      getBidsByItemId(Number(auctionId))
    ])
      .then(([itemData, bidsData]) => {
        // Map backend bids to expected frontend format
        const mappedBids = (bidsData || []).map((bid: any) => ({
          ...bid,
          timestamp: new Date(bid.bidTime),
          bidder: {
            ...bid.bidder,
            avatar: bid.bidder.avatar || '/default-avatar.png',
            name: bid.bidder.name || bid.bidder.username || 'Unknown',
          },
        }));
        setAuction({ ...itemData, bids: mappedBids });
        setBids(mappedBids);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch auction.');
        setLoading(false);
      });
  }, [auctionId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The auction you're looking for doesn't exist or has been removed."}</p>
          <button
            onClick={() => onPageChange('browse')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onPageChange('browse')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Browse</span>
          </button>
        </div>
      </div>

      <AuctionDetail auction={auction} />
    </div>
  );
}