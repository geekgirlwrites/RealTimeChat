import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js"
import { DiscussServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
const MODEL_NAME = "models/chat-bison-001";
const API_KEY = "YOUR-API-KEY"

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

        if (!conversation) {
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

        // SOCKET IO functionality
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    
        const receiver = await User.findById(receiverId);
        
        if (receiver.status === 'BUSY') {
            try {
                //SOCKET IO functionality
                const receiverSocketId = getReceiverSocketId(senderId);
                const senderSocketId = getReceiverSocketId(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", newMessage);
		        }
                
                const LLMresponse = await generateAutoReply(message, res);
                console.log(LLMresponse);
                const busyMessage = await createSimulatedMessage(receiverId, senderId, LLMresponse); //switched sender and reciever id
                console.log(busyMessage);

            
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", newMessage);
		        }
                if (senderSocketId) {
                    io.to(senderSocketId).emit("busyMessage", busyMessage);
		        }
                
                return res.status(200).json(busyMessage);
            } catch (error) {
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", newMessage);
		        }
                console.log("Error inside google thing message: ", error.message);
                return res.status(200).json({ message: "User not available" });
            }
        }
    } catch (error) {
        console.log("Error sending message: ", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
const client = new DiscussServiceClient({ authClient: new GoogleAuth().fromAPIKey(API_KEY), });


async function generateAutoReply(prompt, res) {
    const timeout = 10000; // 10 seconds in milliseconds

    try {
        // Promise for the LLM response
        const llmPromise = client.generateMessage({
            model: MODEL_NAME,
            prompt: {
                messages: [{ content: prompt }],
            },
        });

        // Promise for the timeout
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('LLM response timed out')), timeout);
        });

        // Use Promise.race to wait for the first to resolve/reject
        const result = await Promise.race([llmPromise, timeoutPromise]);

        if (result instanceof Error) {
            console.error('LLM response timed out after 10 seconds');
            throw new Error('AbortError'); // Re-throw a generic error
        }

        console.log(result[0]);
        return result[0].candidates[0].content;
    } catch (error) {
        // Handle errors, including the case where the request was aborted
        if (error.name === 'AbortError') {
            console.log('Request aborted');
            return ""
        } else {
            console.error('Error in generateAutoReply:', error.message);
            return res.status(200).json({ message: 'User unavaible' });
        }
    }
}

async function createSimulatedMessage(senderId, receiverId, text) {

    const newMessage = new Message({
        senderId,  // ID of the recipient acting as sender
        receiverId,  // ID of the original sender
        message: text
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

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
        }

    return newMessage;
}
export { sendMessage, getMessages }