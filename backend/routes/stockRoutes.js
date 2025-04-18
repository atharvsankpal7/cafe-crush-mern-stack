import express from "express";
import {
    listStock,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    updateStockQuantity,
    getLowStockItems,
    getStockSummary
} from "../controllers/stockController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all stock items
router.get("/list", listStock);

// Get stock summary
router.get("/summary", getStockSummary);

// Get low stock items
router.get("/low-stock", getLowStockItems);


// Add new stock item
router.post("/add", addStockItem);

// Update stock item
router.put("/:id", updateStockItem);

// Delete stock item
router.delete("/:id", deleteStockItem);

// Update stock quantity
router.patch("/:id/quantity", updateStockQuantity);

export default router; 