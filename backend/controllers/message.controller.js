import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

const getMessages = async (req, res) => {
    try {
        const recepientId = req.params.id
        const senderId = req.user._id

        const conversation = await Conversation.findOne({
            participants: {
                $all: [senderId, recepientId]
            }
        }).populate("messages") // replacing ids of messages with the actual message objects

        if (!conversation) {
            return res.status(200).json([]) //returns empty array if no conversation exists
        }

        return res.status(200).json(conversation.messages)
    } catch (error) {
        console.log("Error getting messages: ", error.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let conversation = await Conversation.findOne({
            participants: {
                $all: [senderId, receiverId]
            }
        })

        if(!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            message
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id)
        }

        await Promise.all([newMessage.save(), conversation.save()])

        const receiver = await User.findById(receiverId);

        if (receiver.onlineStatus === 'BUSY') {
            const busyMessage = await createSimulatedMessage(receiverId, senderId, message);
            console.log("user is busy")
            return res.status(200).json(busyMessage);
        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.log("Error sending message: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

async function createSimulatedMessage(senderId, receiverId, text) {
    const response = await callLLMA(text);
    const newMessage = new Message({
        senderId,  // ID of the recipient acting as sender
        receiverId,  // ID of the original sender
        message: response
    });
    await newMessage.save();

    // Add this message to an existing or new conversation
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId]
        });
    }

    console.log("good times :)")

    conversation.messages.push(newMessage._id);
    await conversation.save();

    return newMessage;
}

export { sendMessage, getMessages }