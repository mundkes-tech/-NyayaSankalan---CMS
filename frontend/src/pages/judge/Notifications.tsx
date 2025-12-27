import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Filter, Search } from 'lucide-react';
import { getNotifications, addNotification } from '../../utils/localStorage';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notifications for current user or global notifications
  const userNotifications = notifications.filter(n => !n.userId || n.userId === user?.id);

  // Apply filters
  const filteredNotifications = userNotifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read) ||
      notification.type === filter;

    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('police_court_notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('police_court_notifications', JSON.stringify(updatedNotifications));
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('police_court_notifications', JSON.stringify(updatedNotifications));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <X className="h-5 w-5 text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-400';
      case 'warning': return 'border-l-yellow-400';
      case 'error': return 'border-l-red-400';
      default: return 'border-l-blue-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Generate some sample notifications if none exist
  React.useEffect(() => {
    if (notifications.length === 0 && user) {
      const sampleNotifications = [
        {
          title: 'Welcome to Police → Court Platform',
          message: 'Your account has been set up successfully. You can now start managing FIRs and cases.',
          type: 'info' as const,
          read: false,
          userId: user.id
        },
        {
          title: 'Document Upload Required',
          message: 'Case CASE-2024-001 is missing required documents. Please upload the charge sheet.',
          type: 'warning' as const,
          read: false,
          userId: user.id
        },
        {
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur this Saturday from 2-4 AM. Plan accordingly.',
          type: 'info' as const,
          read: true,
          userId: user.id
        }
      ];

      sampleNotifications.forEach(notification => {
        addNotification(notification);
      });
      setNotifications(getNotifications());
    }
  }, [user, notifications.length]);

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">Stay updated with system alerts and case updates</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mark all as read
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-red-100">
            {unreadCount} unread
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-900 border-l-4 ${getNotificationBg(notification.type)} border-gray-800 rounded-lg p-6 ${
                !notification.read ? 'bg-gray-850' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-400">No notifications found</p>
            <p className="text-sm text-gray-500">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;