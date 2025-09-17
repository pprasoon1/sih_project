import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const NotificationHandler = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleReportUpdate = (updatedReport) => {
      console.log("Personal report update received:", updatedReport);
      const message = `Status of '${updatedReport.title}' is now '${updatedReport.status}'.`;
      // Show a success toast notification
      toast.success(message, {
        duration: 6000, // Make it last a bit longer
      });
    };

    // Listen for events targeted specifically at this user
    socket.on('reportUpdated', handleReportUpdate);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('reportUpdated', handleReportUpdate);
    };
  }, [socket]);

  // This component does not render any visible UI itself
  return null; 
};

export default NotificationHandler;