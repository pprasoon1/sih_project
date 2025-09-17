import Notification from '../models/Notification.js';

export const createAndEmitNotification = async (io, recipientId, title, body, reportId) => {
  try {
    // 1. Save the notification to the database
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      body,
      reportId,
    });
    
    // 2. Emit the notification in real-time to the user's private room
    io.to(recipientId.toString()).emit('newNotification', notification);
  } catch (error) {
    console.error(`Error creating notification for ${recipientId}:`, error);
  }
};