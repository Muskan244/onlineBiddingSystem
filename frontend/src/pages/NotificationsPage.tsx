import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Eye, Clock, Trophy, AlertCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';
import Toast from '../components/Common/Toast';

interface NotificationsPageProps {
  onPageChange: (page: string, auctionId?: string) => void;
}

export default function NotificationsPage({ onPageChange }: NotificationsPageProps) {
  const { auth, app, markNotificationRead, markAllNotificationsRead, deleteNotification } = useApp();
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your notifications.</p>
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

  const userNotifications = app.notifications.filter(n => n.userId === auth.user!.id);
  const unreadNotifications = userNotifications.filter(n => !n.read);
  
  const displayNotifications = selectedTab === 'unread' 
    ? unreadNotifications 
    : userNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_placed':
        return <Bell className="w-5 h-5 text-blue-600" />;
      case 'outbid':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'auction_won':
        return <Trophy className="w-5 h-5 text-green-600" />;
      case 'auction_ended':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid_placed':
        return 'border-l-blue-500';
      case 'outbid':
        return 'border-l-amber-500';
      case 'auction_won':
        return 'border-l-green-500';
      case 'auction_ended':
        return 'border-l-gray-500';
      case 'new_message':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    
    // Navigate to the notification's action URL if available
    if (notification.actionUrl) {
      const auctionId = notification.actionUrl.split('/').pop();
      if (auctionId) {
        onPageChange('auction-detail', auctionId);
      }
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setToast({ type: 'success', message: 'All notifications marked as read' });
  };

  const handleDeleteNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notificationId);
    setToast({ type: 'success', message: 'Notification deleted' });
  };

  const tabs = [
    { id: 'all', label: 'All', count: userNotifications.length },
    { id: 'unread', label: 'Unread', count: unreadNotifications.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your auction activity</p>
          </div>
          
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userNotifications.length}
            </div>
            <div className="text-gray-600">Total Notifications</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {unreadNotifications.length}
            </div>
            <div className="text-gray-600">Unread</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userNotifications.filter(n => n.type === 'auction_won').length}
            </div>
            <div className="text-gray-600">Auctions Won</div>
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

        {/* Notifications List */}
        {displayNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              <Bell className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'unread' 
                ? "You're all caught up! Check back later for new updates."
                : "When you start bidding or selling, you'll see notifications here."
              }
            </p>
            {selectedTab !== 'unread' && (
              <button
                onClick={() => onPageChange('browse')}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Auctions
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 cursor-pointer hover:shadow-md transition-all duration-200 ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(notification.timestamp)}</span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationRead(notification.id);
                              setToast({ type: 'success', message: 'Marked as read' });
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {notification.actionUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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