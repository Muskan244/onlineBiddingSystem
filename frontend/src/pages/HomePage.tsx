import React from 'react';
import { TrendingUp, Clock, Shield, Users, ArrowRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuctionCard from '../components/Auction/AuctionCard';

interface HomePageProps {
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const { app, auth } = useApp();
  
  // Get featured auctions (ending soon)
  const featuredAuctions = app.auctions
    .filter(auction => auction.status === 'active')
    .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
    .slice(0, 6);

  const handleViewAuction = (auctionId: string) => {
    onPageChange('auction-detail', auctionId);
  };

  const stats = [
    { icon: Users, label: 'Active Users', value: '25,000+', color: 'text-blue-600' },
    { icon: TrendingUp, label: 'Live Auctions', value: '1,200+', color: 'text-green-600' },
    { icon: Clock, label: 'Items Sold', value: '50,000+', color: 'text-purple-600' },
    { icon: Shield, label: 'Success Rate', value: '98.5%', color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Rare Finds,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                Win Big Auctions
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100 animate-slide-up">
              Join thousands of collectors and enthusiasts in the world's most trusted online auction platform.
              Find unique items, place competitive bids, and build your collection today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button
                onClick={() => onPageChange('browse')}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Start Bidding</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {!auth.isAuthenticated && (
                <button
                  onClick={() => onPageChange('register')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Join Free Today
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white bg-opacity-5 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-amber-400 bg-opacity-20 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors mb-4 ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Auctions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these exciting auctions ending soon. Place your bids now!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onView={() => handleViewAuction(auction.id)}
                showWatchlist={auth.isAuthenticated}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => onPageChange('browse')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
            >
              <span>View All Auctions</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How BidHub Works
            </h2>
            <p className="text-xl text-gray-600">
              Start bidding in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Browse & Discover</h3>
              <p className="text-gray-600">
                Explore thousands of unique items across various categories. Use our advanced search and filters to find exactly what you're looking for.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-secondary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <span className="text-2xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Place Your Bid</h3>
              <p className="text-gray-600">
                Found something you love? Place your bid with confidence. Our real-time bidding system keeps you updated on the latest activity.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-accent-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent-200 transition-colors">
                <span className="text-2xl font-bold text-accent-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Win & Collect</h3>
              <p className="text-gray-600">
                Won an auction? Congratulations! Complete your purchase securely and enjoy your new treasure with our buyer protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Art Collector',
                image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                quote: 'Found amazing vintage pieces here that I couldn\'t find anywhere else. The bidding process is smooth and transparent.',
                rating: 5,
              },
              {
                name: 'Mike Chen',
                role: 'Electronics Enthusiast',
                image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                quote: 'Great platform for finding rare electronics. Won several auctions and everything arrived exactly as described.',
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Antique Dealer',
                image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                quote: 'As a seller, I love how easy it is to list items and reach a global audience. The fees are reasonable too.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Auction Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied buyers and sellers on BidHub today.
          </p>
          {!auth.isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onPageChange('register')}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => onPageChange('browse')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Browse Auctions
              </button>
            </div>
          ) : (
            <button
              onClick={() => onPageChange('browse')}
              className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Start Bidding Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}