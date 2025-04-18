import express from 'express';
import { addReview, getReviews, getUserReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/list", getReviews);
reviewRouter.post("/user", authMiddleware, getUserReviews);

export default reviewRouter;