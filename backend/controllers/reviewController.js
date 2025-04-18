import Review from "../models/reviewModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

// Add a review
export const addReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const userId = req.body.userId;

        const review = new Review({
            userId,
            orderId,
            rating,
            comment
        });

        await review.save();
        res.status(201).json({ success: true, message: "Review added successfully" });
    } catch (error) {
        console.error("Error in addReview:", error);
        res.status(500).json({ success: false, message: "Error adding review" });
    }
};

// Get all reviews with user and order details
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        
        // Get user and order details for each review
        const reviewsWithDetails = await Promise.all(reviews.map(async (review) => {
            const user = await userModel.findById(review.userId);
            const order = await orderModel.findById(review.orderId);
            
            return {
                ...review.toObject(),
                userName: user ? user.name : 'Unknown User',
                orderDetails: order ? {
                    items: order.items,
                    amount: order.amount,
                    date: order.date,
                    status: order.status
                } : null
            };
        }));

        res.status(200).json({ success: true, data: reviewsWithDetails });
    } catch (error) {
        console.error("Error in getReviews:", error);
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
};

// Get reviews by user
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.body.userId;
        const reviews = await Review.find({ userId }).sort({ date: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Error in getUserReviews:", error);
        res.status(500).json({ success: false, message: "Error fetching user reviews" });
    }
};