import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Star, Trophy, Award, Edit2, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Toast from '../components/Common/Toast';
import { fetchUserProfile, updateUserProfile } from '../api/user';

interface ProfilePageProps {
  onPageChange: (page: string) => void;
}

export default function ProfilePage({ onPageChange }: ProfilePageProps) {
  const { auth } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(auth.user);
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    if (auth.user) {
      fetchUserProfile(auth.user.id).then(setProfile);
    }
  }, [auth.user]);

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
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

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleSave = async () => {
    try {
      const updated = await updateUserProfile(profile.id, {
        name: formData.name,
        email: formData.email,
      });
      setProfile(updated);
    setToast({ type: 'success', message: 'Profile updated successfully!' });
    setIsEditing(false);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
    });
    setIsEditing(false);
  };

  const stats = [
    { icon: Trophy, label: 'Auctions Won', value: '12', color: 'text-yellow-600' },
    { icon: Star, label: 'Average Rating', value: typeof profile.rating === 'number' ? profile.rating.toFixed(1) : 'N/A', color: 'text-blue-600' },
    { icon: Award, label: 'Total Bids', value: typeof profile.totalBids === 'number' ? profile.totalBids.toString() : '0', color: 'text-green-600' },
  ];

  if (profile.role !== 'bidder') {
    stats.push({
      icon: Award,
      label: 'Items Sold',
      value: typeof profile.totalSales === 'number' ? profile.totalSales.toString() : '0',
      color: 'text-purple-600'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-primary-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                    {profile.isVerified && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(profile.joinedAt).getFullYear()}</span>
                  </div>
                  <div className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium capitalize mb-4">
                    {profile.role}
                  </div>
                  <div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors mx-auto md:mx-0"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onPageChange('browse')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-primary-600 mb-2">🔍</div>
              <div className="font-medium">Browse Auctions</div>
            </button>
            
            <button
              onClick={() => onPageChange('my-bids')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-green-600 mb-2">📋</div>
              <div className="font-medium">My Bids</div>
            </button>

            {profile.role !== 'bidder' && (
              <>
                <button
                  onClick={() => onPageChange('my-listings')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="text-blue-600 mb-2">📦</div>
                  <div className="font-medium">My Listings</div>
                </button>

                <button
                  onClick={() => onPageChange('create-auction')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="text-purple-600 mb-2">➕</div>
                  <div className="font-medium">Create Auction</div>
                </button>
              </>
            )}
          </div>
        </div>
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