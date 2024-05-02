import express from "express";
import { getUsers, setStatusBusy } from "../controllers/user.controller.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/", checkAuth, getUsers)
router.put("/status/:state", checkAuth, setStatusBusy)
export default router;