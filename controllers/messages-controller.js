const HttpError = require('../models/http-error');

const Message = require('../models/message');

const getMessagesByOid = async (orderId) => {
  let messages;
  try {
    messages = await Message.find({ oid: orderId });
  } catch (err) {
    const error = new HttpError('Something went wrong.', 500);
    return next(error);
  }
  if (!messages) {
    const error = new HttpError('No Messages', 404);
    return next(error);
  }
  return messages;
};

const addMessage = async (message) => {
  const newMessage = new Message({
    oid: message.oid,
    timestamp: message.timestamp,
    author: message.user,
    message: message.message,
  });

  try {
    await newMessage.save();
  } catch (err) {
    const error = new HttpError(
      'Message Submission Failed - Try again :(',
      500
    );
    throw error;
  }

  return;
};

exports.getMessagesByOid = getMessagesByOid;
exports.addMessage = addMessage;
