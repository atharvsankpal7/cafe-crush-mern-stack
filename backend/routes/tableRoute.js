import express from 'express';
import { getAllTables, bookTable, releaseTable } from '../controllers/tableController.js';
import authMiddleware from '../middleware/auth.js';

const tableRouter = express.Router();

tableRouter.get("/list", getAllTables);
tableRouter.post("/book", authMiddleware, bookTable);
tableRouter.post("/release", authMiddleware, releaseTable);

export default tableRouter;