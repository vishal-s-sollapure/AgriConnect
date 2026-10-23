const mongoose = require('mongoose');
const Notification = require('../models/Notification');

function parsePositiveInteger(value, fallback, maximum) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

exports.getMyNotifications = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 10000);
    const limit = parsePositiveInteger(req.query.limit, 10, 50);
    if (!page || !limit) {
      return res.status(400).json({ success: false, message: 'Invalid pagination values' });
    }
    if (req.query.unreadOnly !== undefined && !['true', 'false'].includes(req.query.unreadOnly)) {
      return res.status(400).json({ success: false, message: 'unreadOnly must be true or false' });
    }

    const query = { recipient: req.user._id };
    if (req.query.unreadOnly === 'true') query.readAt = null;
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .select('type titleKey messageKey data readAt createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query)
    ]);
    return res.status(200).json({
      success: true,
      notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not load notifications' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, readAt: null });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Get unread notification count error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not load unread notification count' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, readAt: null },
      { $set: { readAt: new Date() } },
      { new: true }
    ).select('type titleKey messageKey data readAt createdAt');
    if (notification) return res.status(200).json({ success: true, notification });

    const exists = await Notification.exists({ _id: req.params.id, recipient: req.user._id });
    if (exists) {
      const alreadyRead = await Notification.findOne({ _id: req.params.id, recipient: req.user._id })
        .select('type titleKey messageKey data readAt createdAt');
      return res.status(200).json({ success: true, notification: alreadyRead });
    }
    return res.status(404).json({ success: false, message: 'Notification not found' });
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not update notification' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return res.status(200).json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error('Mark all notifications read error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not update notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    const result = await Notification.deleteOne({ _id: req.params.id, recipient: req.user._id });
    if (!result.deletedCount) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error.message);
    return res.status(500).json({ success: false, message: 'Could not delete notification' });
  }
};
