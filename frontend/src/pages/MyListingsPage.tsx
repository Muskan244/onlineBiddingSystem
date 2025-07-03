import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatTimeLeft, formatDate } from '../utils/format';
import Modal from '../components/Common/Modal';
import Toast from '../components/Common/Toast';

interface MyListingsPageProps {
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function MyListingsPage({ onPageChange }: MyListingsPageProps) {
  const { auth, app, deleteAuction } = useApp();
  const [selectedTab, setSelectedTab] = useState<'active' | 'ended' | 'draft'>('active');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState<string | null>(null);

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your listings.</p>
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

  if (auth.user.role === 'bidder') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be a seller to access this page.</p>
          <button
            onClick={() => onPageChange('home')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Debug: Log auctions and current user id
  //console.log('auctions:', app.auctions);
  //console.log('current user id:', auth.user?.id);

  // Get user's listings
  const userListings = app.auctions.filter(auction => auction.sellerId.toString() === auth.user!.id.toString());

  const activeListings = userListings.filter(auction => 
    auction.status === 'active' && auction.endTime.getTime() > Date.now()
  );

  const endedListings = userListings.filter(auction => 
    auction.status === 'ended' || auction.endTime.getTime() <= Date.now()
  );

  // Debug: Log userListings and activeListings
  //console.log('userListings:', userListings);
  //console.log('activeListings:', activeListings);

  const handleDeleteAuction = (auctionId: string) => {
    console.log('handleDeleteAuction called with', auctionId);
    const auction = app.auctions.find(a => a.id === auctionId);
    if (!auction) return;

    if (auction.bids.length > 0) {
      setToast({ 
        type: 'error', 
        message: 'Cannot delete auction with existing bids' 
      });
      return;
    }

    setAuctionToDelete(auctionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    console.log('confirmDelete called with', auctionToDelete);
    if (auctionToDelete) {
      const success = await deleteAuction(auctionToDelete);
      if (success) {
        setToast({ 
          type: 'success', 
          message: 'Auction deleted successfully' 
        });
      } else {
        setToast({ 
          type: 'error', 
          message: 'Failed to delete auction' 
        });
      }
    }
    setShowDeleteModal(false);
    setAuctionToDelete(null);
  };

  const renderListingCard = (auction: any) => {
    const isEnded = auction.endTime.getTime() <= Date.now();
    const hasWinner = auction.bids.length > 0;
    const winningBid = auction.bids.sort((a: any, b: any) => b.amount - a.amount)[0];

    return (
      <div key={auction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {auction.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Started {formatDate(auction.startTime)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange('auction-detail', auction.id)}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                {!isEnded && (
                  <>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                      onClick={() => onPageChange('edit-auction', auction.id)}>
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium"
                      onClick={() => handleDeleteAuction(auction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Starting Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(auction.startingPrice)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Current Bid</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(auction.currentBid)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Total Bids</p>
                <p className="text-lg font-semibold text-gray-900">
                  {auction.bids.length}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  {isEnded ? 'Ended' : 'Time Left'}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {isEnded ? formatDate(auction.endTime) : formatTimeLeft(auction.endTime)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isEnded ? (
                  hasWinner ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Sold</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">No Sale</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
              
              {isEnded && hasWinner && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Winner</p>
                  <p className="text-sm font-medium text-gray-900">
                    {winningBid.bidder.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'active', label: 'Active', count: activeListings.length },
    { id: 'ended', label: 'Ended', count: endedListings.length },
    { id: 'draft', label: 'Drafts', count: 0 },
  ];

  const getCurrentListings = () => {
    switch (selectedTab) {
      case 'active':
        return activeListings;
      case 'ended':
        return endedListings;
      case 'draft':
        return [];
      default:
        return activeListings;
    }
  };

  const currentListings = getCurrentListings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your auction listings</p>
          </div>
          <button
            onClick={() => onPageChange('create-auction')}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Auction</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userListings.length}
            </div>
            <div className="text-gray-600">Total Listings</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {endedListings.filter(a => a.bids.length > 0).length}
            </div>
            <div className="text-gray-600">Sold Items</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userListings.reduce((sum, auction) => sum + auction.bids.length, 0)}
            </div>
            <div className="text-gray-600">Total Bids</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(userListings.reduce((sum, auction) => sum + auction.currentBid, 0))}
            </div>
            <div className="text-gray-600">Total Value</div>
          </div>
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
        {currentListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              <Plus className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab === 'active' && 'No Active Listings'}
              {selectedTab === 'ended' && 'No Ended Listings'}
              {selectedTab === 'draft' && 'No Draft Listings'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'active' && "You don't have any active auctions."}
              {selectedTab === 'ended' && "You don't have any ended auctions."}
              {selectedTab === 'draft' && "You don't have any draft listings."}
            </p>
            <button
              onClick={() => onPageChange('create-auction')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Auction
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {currentListings.map(renderListingCard)}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Auction"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this auction?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                This action cannot be undone. The auction will be permanently removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Auction
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