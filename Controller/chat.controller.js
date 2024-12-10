import prisma from "../Lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId; // Assuming `req.userId` is set by a middleware (like JWT authentication)

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId], // Find chats where the tokenUserId is part of the chat's userIDs
        },
      },
    });

    // Iterate over the chats
    for (const chat of chats) {
      // Find the receiverId by getting the ID that isn't the tokenUserId
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      if (!receiverId) {
        console.log("Receiver ID not found in chat:", chat);
        continue; // Skip if no receiverId is found (this may indicate an issue with the data)
      }

      console.log("Receiver ID:", receiverId); // Debugging log

      // Fetch the receiver's details
      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId, // Ensure we're using a valid receiverId
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });

      if (!receiver) {
        console.log("Receiver not found for ID:", receiverId);
        continue; // Skip if receiver is not found
      }

      console.log("Fetched Receiver:", receiver); // Debugging log

      // Attach the receiver information to the chat
      chat.receiver = receiver;
    }

    res.status(200).json(chats); // Respond with the chats including receiver details
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, req.body.receiverId],
      },
    });
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};
export const deleteChat = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.id;

  try {
    // Fetch the chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true }, // Include related messages
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    // Ensure user is authorized to delete the chat
    if (!chat.userIDs.includes(tokenUserId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this chat!" });
    }

    // Delete related messages first
    await prisma.message.deleteMany({
      where: {
        chatId: chatId, // Delete all messages in this chat
      },
    });

    // Now delete the chat
    await prisma.chat.delete({
      where: { id: chatId },
    });

    // Get the updated list of chats for the current user
    const updatedChats = await prisma.chat.findMany({
      where: {
        userIDs: {
          has: tokenUserId,
        },
      },
    });

    res.status(200).json(updatedChats);
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: "Failed to delete chat!" });
  }
};
