import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { FaBell } from 'react-icons/fa';
import NotificationPanel from './NotificationPanel';
import './NotificationIcon.css';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // --- Start of Fix ---
        // Verify that the response data is an array before using it
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        } else {
          // If not an array, log the issue and default to empty arrays
          console.error("API did not return an array for notifications:", res.data);
          setNotifications([]);
          setUnreadCount(0);
        }
        // --- End of Fix ---

      } catch (error) {
        console.error("Failed to fetch notifications", error);
        setNotifications([]); // Ensure state is an array even on error
      }
    };
    fetchNotifications();
  }, []);

  // ... (the rest of your component remains the same)

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
        await axios.post('/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
        // Also update the local state to reflect the read status
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
      }
    }
  };

  return (
    <div className="notification-wrapper">
      <div className="notification-icon" onClick={handleIconClick}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      {isPanelOpen && <NotificationPanel notifications={notifications} />}
    </div>
  );
};

export default NotificationIcon;