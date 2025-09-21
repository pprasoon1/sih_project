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

  // This effect runs ONCE on mount to fetch historical notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/notifications', {
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

  // --- THIS IS THE REAL-TIME LOGIC ---
  // This effect listens for new notifications coming from the WebSocket
  useEffect(() => {
    if (!socket) return; // Don't run if the socket isn't connected yet
    
    const handleNewNotification = (newNotification) => {
      // Add the new notification to the top of the list in real-time
      setNotifications(prev => [newNotification, ...prev]);
      // Increment the unread count badge in real-time
      setUnreadCount(prev => prev + 1);
    };

    // Listen for the 'newNotification' event from the server
    socket.on('newNotification', handleNewNotification);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]); // Dependency array ensures this runs when the socket is ready

  const handleIconClick = async () => {
    setIsPanelOpen(prev => !prev);
    if (!isPanelOpen && unreadCount > 0) {
      const token = localStorage.getItem('token');
      try {
        await axios.post('/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
        // Also update the local state to reflect the read status visually
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