import express from "express";
import {
    listOrders,
    getOrderDetails,
    getOrdersSummary,
    updateOrderStatus,
    getPaymentHistory
} from "../controllers/salesController.js";
import authMiddleware from "../middleware/auth.js";

const salesRouter = express.Router();

// All routes require authentication
// salesRouter.use(authMiddleware);

// Get all orders with filters
salesRouter.get("/list", listOrders);

// Get single order details

// Get orders summary
salesRouter.get("/summary", getOrdersSummary);

// Update order status

// Get payment history
salesRouter.get("/:id", getOrderDetails);
salesRouter.put("/:id/status", updateOrderStatus);
salesRouter.get("/payments/history", getPaymentHistory);

export default salesRouter; 