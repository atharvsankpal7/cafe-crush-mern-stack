import express from "express";
import { addStaff, listStaff, updateStaff, removeStaff, loginStaff } from "../controllers/staffController.js";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";

const staffRouter = express.Router();

// Configure multer for staff profile images
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

staffRouter.post("/login", loginStaff);
staffRouter.get("/list", authMiddleware, listStaff);
staffRouter.post("/add", authMiddleware, upload.single('photo'), addStaff);
staffRouter.put("/update", authMiddleware, upload.single('photo'), updateStaff);
staffRouter.delete("/remove", authMiddleware, removeStaff);

export default staffRouter;