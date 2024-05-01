import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    onlineStatus: {
        type: String,
        enum: ['AVAILABLE', 'BUSY'],
        default: 'AVAILABLE'
    }
    
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User