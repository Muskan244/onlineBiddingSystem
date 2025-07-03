import React, { useState, useEffect } from 'react';
import { Upload, X, Calendar, DollarSign, Package, MapPin, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';
import Toast from '../components/Common/Toast';

interface EditAuctionPageProps {
  auctionId: string | null;
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function EditAuctionPage({ auctionId, onPageChange }: EditAuctionPageProps) {
  const { auth, app, editAuction } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    startingPrice: 0,
    minBidIncrement: 1,
    endTime: '',
    isReserved: false,
    reservePrice: 0,
    condition: 'good' as 'new' | 'like-new' | 'good' | 'fair' | 'poor',
    location: '',
    shippingFree: false,
    shippingCost: 0,
    shippingInternational: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auction = auctionId ? app.auctions.find(a => a.id === auctionId) : null;

  useEffect(() => {
    if (auction) {
      setFormData({
        title: auction.title,
        description: auction.description,
        category: auction.category,
        startingPrice: auction.startingPrice,
        minBidIncrement: auction.minBidIncrement,
        endTime: auction.endTime.toISOString().slice(0, 16),
        isReserved: auction.isReserved,
        reservePrice: auction.reservePrice || 0,
        condition: auction.condition,
        location: auction.location,
        shippingFree: auction.shipping.free,
        shippingCost: auction.shipping.cost || 0,
        shippingInternational: auction.shipping.international,
      });
      setImages(auction.images);
      setIsLoading(false);
    } else if (auctionId) {
      setToast({ type: 'error', message: 'Auction not found' });
      setTimeout(() => onPageChange('my-listings'), 2000);
    }
  }, [auction, auctionId, onPageChange]);

  if (!auth.user || auth.user.role === 'bidder') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be a seller to edit auctions.</p>
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

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h2>
          <p className="text-gray-600 mb-6">The auction you're trying to edit doesn't exist.</p>
          <button
            onClick={() => onPageChange('my-listings')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  if (auction.sellerId.toString() !== auth.user.id.toString()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You can only edit your own auctions.</p>
          <button
            onClick={() => onPageChange('my-listings')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  const isAuctionEnded = auction.endTime.getTime() <= Date.now();
  const hasBids = auction.bids.length > 0;

  if (isAuctionEnded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cannot Edit Ended Auction</h2>
          <p className="text-gray-600 mb-6">This auction has already ended and cannot be modified.</p>
          <button
            onClick={() => onPageChange('my-listings')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.endTime || images.length === 0) {
      setToast({ type: 'error', message: 'Please fill in all required fields and add at least one image' });
      return;
    }

    if (formData.startingPrice <= 0) {
      setToast({ type: 'error', message: 'Starting price must be greater than 0' });
      return;
    }

    const endTime = new Date(formData.endTime);
    if (endTime <= new Date()) {
      setToast({ type: 'error', message: 'End time must be in the future' });
      return;
    }

    // If auction has bids, restrict certain changes
    if (hasBids) {
      if (formData.startingPrice !== auction.startingPrice) {
        setToast({ type: 'error', message: 'Cannot change starting price after bids have been placed' });
        return;
      }
      if (formData.isReserved !== auction.isReserved || formData.reservePrice !== (auction.reservePrice || 0)) {
        setToast({ type: 'error', message: 'Cannot change reserve settings after bids have been placed' });
        return;
      }
    }

    const success = await editAuction(auction.id, {
      name: formData.title,
      description: formData.description,
      startingPrice: formData.startingPrice,
      biddingEndTime: endTime,
      imageUrl: images[0] || null,
      // Add other backend fields as needed
    });

    if (success) {
      setToast({ type: 'success', message: 'Auction updated successfully!' });
      setTimeout(() => onPageChange('my-listings'), 1500);
    } else {
      setToast({ type: 'error', message: 'Failed to update auction. Please try again.' });
    }
  };

  const addSampleImage = () => {
    const sampleImages = [
      'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1340502/pexels-photo-1340502.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];
    
    const availableImages = sampleImages.filter(img => !images.includes(img));
    if (availableImages.length > 0) {
      setImages([...images, availableImages[0]]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auction details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onPageChange('my-listings')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Listings</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Auction</h1>
          <p className="text-gray-600">Update your auction details</p>
          
          {hasBids && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> This auction has received bids. Some fields cannot be modified to maintain fairness for bidders.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter a descriptive title for your item"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Provide detailed information about your item including condition, history, and any flaws"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.filter(cat => cat.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images *</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={addSampleImage}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Add Image</span>
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Add up to 4 high-quality images. The first image will be used as the main image.
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              <DollarSign className="w-5 h-5 inline mr-2" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price *
                  {hasBids && <span className="text-amber-600 text-xs ml-2">(Cannot be changed)</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="startingPrice"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={hasBids}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="minBidIncrement" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Bid Increment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="minBidIncrement"
                    value={formData.minBidIncrement}
                    onChange={(e) => setFormData({ ...formData, minBidIncrement: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isReserved"
                    checked={formData.isReserved}
                    onChange={(e) => setFormData({ ...formData, isReserved: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    disabled={hasBids}
                  />
                  <label htmlFor="isReserved" className="ml-2 block text-sm text-gray-900">
                    Set a reserve price (minimum price to sell)
                    {hasBids && <span className="text-amber-600 text-xs ml-2">(Cannot be changed)</span>}
                  </label>
                </div>
              </div>

              {formData.isReserved && (
                <div>
                  <label htmlFor="reservePrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Reserve Price
                    {hasBids && <span className="text-amber-600 text-xs ml-2">(Cannot be changed)</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="reservePrice"
                      value={formData.reservePrice}
                      onChange={(e) => setFormData({ ...formData, reservePrice: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={hasBids}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auction Duration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              <Calendar className="w-5 h-5 inline mr-2" />
              Auction Duration
            </h2>
            
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                Auction End Date & Time *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              <Package className="w-5 h-5 inline mr-2" />
              Shipping Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shippingFree"
                  checked={formData.shippingFree}
                  onChange={(e) => setFormData({ ...formData, shippingFree: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="shippingFree" className="ml-2 block text-sm text-gray-900">
                  Offer free shipping
                </label>
              </div>

              {!formData.shippingFree && (
                <div>
                  <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="shippingCost"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shippingInternational"
                  checked={formData.shippingInternational}
                  onChange={(e) => setFormData({ ...formData, shippingInternational: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="shippingInternational" className="ml-2 block text-sm text-gray-900">
                  Offer international shipping
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onPageChange('my-listings')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Update Auction
            </button>
          </div>
        </form>
      </div>

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