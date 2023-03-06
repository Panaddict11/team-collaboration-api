const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("cloudinary");

//TODO: Fix send document to support any type of document format

exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { content, chatId } = req.body;

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.sendAudioMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Chat_app_audio",
    resource_type: "video",
  });
  const { chatId } = req.body;

  var newAudioMessage = {
    sender: req.user._id,
    audio: { public_id: myCloud.public_id, url: myCloud.secure_url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newAudioMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});
exports.sendVideoMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Chat_app_video",
    resource_type: "video",
  });
  const { chatId } = req.body;

  var newVideoMessage = {
    sender: req.user._id,
    video: { public_id: myCloud.public_id, url: myCloud.secure_url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newVideoMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.sendImageMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "Chat_app_images",
  });
  const { chatId } = req.body;

  var newMessage = {
    sender: req.user._id,
    image: { public_id: myCloud.public_id, url: myCloud.secure_url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.sendDocumentMessage = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
    resource_type: "auto",
    folder: "Chat_app_document",
  });
  const { chatId } = req.body;

  var newMessage = {
    sender: req.user._id,
    document: { public_id: myCloud.public_id, url: myCloud.url },
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.allMessages = catchAsyncErrors(async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username avatar email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    return next(new ErrorHandler("Invalid request", 400));
  }
});


// TODO: Work on this
exports.deleteMessageFromSelf = catchAsyncErrors(async (req, res, next) => {
  const message = await Message.findOne({
    chat: req.params.chatId,
    _id: req.params.messageId,
  })
    .populate("sender", "username avatar email")
    .populate("chat");

  if (!message) {
   return next(new ErrorHandler("Message not found", 404));
  }

  message.isDeleted = true;
  message.isDeletedBy.push(req.user._id);
  await message.save();

  res.status(200).json({ success: true });
});

exports.deleteMessageFromEverybody = catchAsyncErrors(
  async (req, res, next) => {
    const message = await Message.findOne({
      chat: req.params.chatId,
      _id: req.params.messageId,
    })
      .populate("sender", "username avatar email")
      .populate("chat");

    if (!message) {
      return next(new ErrorHandler("Message not found", 404));
    }

    if (message.sender.toString() === req.user._id.toString()) {
      await message.remove();
      return res.status(200).json({ success: true });
    }

    return next(new ErrorHandler("Unauthorized", 401));
  }
);
