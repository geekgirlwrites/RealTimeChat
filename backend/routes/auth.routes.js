import express from "express";
const router = express.Router();
import {loginUser, signup, logout} from '../controllers/auth.controller.js'
import checkAuth from "../middleware/checkAuth.js";

router.post("/signup", signup);

router.post("/login", loginUser);

router.post("/logout", checkAuth,logout);

export default router;