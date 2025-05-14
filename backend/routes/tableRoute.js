import express from 'express';
import { 
    getAllTables, 
    bookTable, 
    handleBookingRequest, 
    markTableAvailable 
} from '../controllers/tableController.js';
import authMiddleware from '../middleware/auth.js';

const tableRouter = express.Router();

tableRouter.get("/list", getAllTables);
tableRouter.post("/book", authMiddleware, bookTable);
tableRouter.post("/handle-booking", authMiddleware, handleBookingRequest);
tableRouter.post("/mark-available", authMiddleware, markTableAvailable);

export default tableRouter;