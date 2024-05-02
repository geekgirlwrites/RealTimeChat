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
    status: {
        type: String,
        default: "BUSY"
    }
    // created at
    // updated at
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User