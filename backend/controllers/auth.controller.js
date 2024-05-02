import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookie from "../utils/generateToken.js"

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        const checkPass = user?.password || ""
        const isPasswordCorrect = await bcrypt.compare(password, checkPass)

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({error: "Invalid email or password"})
        }

        generateTokenAndSetCookie(user._id, res)

        await User.findOneAndUpdate({ _id: user._id }, {status: "AVAILABLE" }, { new: true }) // set status to available
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email:user.email
        })
        
    }
    catch (error) {
        console.log("Error in loginUser controller: ", error)
        return res.status(500).json({error: error})
    }
}
const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        const userId = req.user._id
        await User.findOneAndUpdate({ _id: userId }, {status: "BUSY" }, { new: true }) // set status to busy
        res.status(200).json({ message: "Logged Out Successfully" })
    } catch (error) {
        console.log("Error in logout controller: ", error)
        return res.status(500).json({error: error})
    }
}
const signup = async (req, res) => {
    console.log("signup")
    try {
        const { fullName, email, password, confirmPassword } = req.body
        if (password !== confirmPassword) {
            console.log(password)
            console.log(confirmPassword)
            return res.status(400).json({error:"Passwords do not match"})
        }
        
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({error: "Email already exists"})
        }
        
        // Hasing the password //
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)

        // Storing the user in the DB //
        const newUser = new User({
            fullName,
            email,
            password: hashedPass
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                fullName: fullName,
                email: email
            })
        } else {
            return res.send(400).json({error: "Invalid User Data"})
        }
    }
    catch (error) {
        console.log("Error signing up: ", error)
        return res.status(500).json({error: error})
    }
}

export { loginUser, logout, signup } 