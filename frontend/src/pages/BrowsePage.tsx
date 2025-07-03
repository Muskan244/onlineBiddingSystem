import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuctionCard from '../components/Auction/AuctionCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { categories } from '../data/mockData';

interface BrowsePageProps {
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function BrowsePage({ onPageChange }: BrowsePageProps) {
  const { app, updateSearchQuery, updateFilters } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(app.searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchQuery(localSearchQuery);
  };

  const filteredAuctions = useMemo(() => {
    let filtered = app.auctions.filter(auction => auction.status === 'active');

    // Search filter
    if (app.searchQuery) {
      filtered = filtered.filter(auction =>
        auction.title.toLowerCase().includes(app.searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(app.searchQuery.toLowerCase()) ||
        auction.category.toLowerCase().includes(app.searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (app.selectedCategory !== 'all') {
      filtered = filtered.filter(auction => auction.category === app.selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(auction =>
      auction.currentBid >= app.priceRange[0] && auction.currentBid <= app.priceRange[1]
    );

    // Sort
    switch (app.sortBy) {
      case 'ending_soon':
        filtered.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'newest':
        filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.bids.length - a.bids.length);
        break;
    }

    return filtered;
  }, [app.auctions, app.searchQuery, app.selectedCategory, app.priceRange, app.sortBy]);

  const handleViewAuction = (auctionId: string) => {
    onPageChange('auction-detail', auctionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Auctions</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search for auctions, items, or categories..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              />
            </div>
          </form>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
              </span>
              <select
                value={app.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ending_soon">Ending Soon</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => updateFilters({ selectedCategory: category.id })}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        app.selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={app.priceRange[0]}
                      onChange={(e) => updateFilters({ 
                        priceRange: [Number(e.target.value), app.priceRange[1]] 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={app.priceRange[1]}
                      onChange={(e) => updateFilters({ 
                        priceRange: [app.priceRange[0], Number(e.target.value)] 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => updateFilters({
                  selectedCategory: 'all',
                  priceRange: [0, 10000],
                  searchQuery: '',
                })}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                  <Search className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse different categories.
                </p>
                <button
                  onClick={() => updateFilters({
                    selectedCategory: 'all',
                    priceRange: [0, 10000],
                    searchQuery: '',
                  })}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    onView={() => handleViewAuction(auction.id)}
                    showWatchlist={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}