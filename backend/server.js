import express from "express";
import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import connectToMongo from "./db/connectToMongo.js";
import { app, server } from "./socket/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes) // authentication related routes
app.use("/api/messages", messageRoutes) // message related routes
app.use("/api/users", userRoutes) // user related routes used for selecting whom to send message

// app.get("/", (req, res) => {
//     res.send("server is ready :)");
// });

server.listen(PORT, () => {
    connectToMongo() // connect to mongoDB
    console.log(`server running on port ${PORT}`)   
});

