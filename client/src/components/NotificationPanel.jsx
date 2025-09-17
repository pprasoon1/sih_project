import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = ({ notifications }) => {
  return (
    <div className="notification-panel">
      <div className="panel-header">Notifications</div>
      <div className="panel-body">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
              <div className="item-title">{notif.title}</div>
              <div className="item-body">{notif.body}</div>
              <div className="item-time">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No notifications yet.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;