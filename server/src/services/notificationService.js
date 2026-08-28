const Notification = require('../models/Notification');
const { emitUserEvent } = require('../config/socket');

const createNotification = async ({ owner, workflowId, executionId, type = 'info', title, message }) => {
  const notification = await Notification.create({
    owner,
    workflowId,
    executionId,
    type,
    title,
    message,
    isRead: false,
  });

  // Emit real-time socket event to user
  emitUserEvent(owner.toString(), 'notification:new', notification);

  return notification;
};

const getNotifications = async (ownerId, { limit = 30, unreadOnly = false } = {}) => {
  const query = { owner: ownerId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('workflowId', 'name')
    .lean();

  const unreadCount = await Notification.countDocuments({ owner: ownerId, isRead: false });

  return { notifications, unreadCount };
};

const markAsRead = async (notificationId, ownerId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, owner: ownerId },
    { isRead: true },
    { new: true }
  );
};

const markAllAsRead = async (ownerId) => {
  await Notification.updateMany({ owner: ownerId, isRead: false }, { isRead: true });
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
