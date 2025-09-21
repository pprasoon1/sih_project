import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { FaBell } from 'react-icons/fa';
import NotificationPanel from './NotificationPanel';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('https://backend-sih-project-l67a.onrender.com/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  const handleIconClick = async () => {
    setIsPanelOpen(prev => !prev);
    if (!isPanelOpen && unreadCount > 0) {
      const token = localStorage.getItem('token');
      try {
        await axios.post('https://backend-sih-project-l67a.onrender.com/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleIconClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isPanelOpen && (
        <NotificationPanel 
          notifications={notifications} 
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationIcon;