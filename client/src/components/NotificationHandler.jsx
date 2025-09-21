import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const NotificationHandler = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // 2. The handler now receives the 'notification' object from the event
    const handleNewNotification = (notification) => {
      console.log("Real-time toast notification received:", notification);
      
      // 3. Use the notification's 'body' for the toast message
      toast.success(notification.body, {
        duration: 6000,
        icon: '🔔',
      });
    };

    // 1. Listen for 'newNotification' instead of 'reportUpdated'
    socket.on('newNotification', handleNewNotification);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  // This component does not render any visible UI itself
  return null; 
};

export default NotificationHandler;