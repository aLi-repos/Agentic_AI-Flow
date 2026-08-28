const notificationService = require('../services/notificationService');

const listNotifications = async (req, res, next) => {
  try {
    const { limit, unreadOnly } = req.query;
    const result = await notificationService.getNotifications(req.user.id, {
      limit: limit ? parseInt(limit, 10) : 30,
      unreadOnly: unreadOnly === 'true',
    });

    return res.status(200).json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
