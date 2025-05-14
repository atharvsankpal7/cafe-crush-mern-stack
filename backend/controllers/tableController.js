import Table from "../models/tableModel.js";

// Initialize tables if they don't exist
export const initializeTables = async () => {
    try {
        const existingTables = await Table.countDocuments();
        if (existingTables === 0) {
            const tables = Array.from({ length: 10 }, (_, i) => ({
                tableNumber: i + 1,
                capacity: 4
            }));
            await Table.insertMany(tables);
        }
    } catch (error) {
        console.error("Error initializing tables:", error);
    }
};

// Get all tables
export const getAllTables = async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        res.json({ success: true, data: tables });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching tables" });
    }
};

// Book a table
export const bookTable = async (req, res) => {
    try {
        const { tableNumber, userId } = req.body;
        
        const table = await Table.findOne({ tableNumber });
        
        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }
        
        if (table.isBooked) {
            return res.status(400).json({ success: false, message: "Table already booked" });
        }
        
        table.isBooked = true;
        table.bookedBy = userId;
        table.bookingTime = new Date();
        
        await table.save();
        
        res.json({ success: true, message: "Table booked successfully", table });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error booking table" });
    }
};

// Release a table
export const releaseTable = async (req, res) => {
    try {
        const { tableNumber } = req.body;
        
        const table = await Table.findOne({ tableNumber });
        
        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }
        
        table.isBooked = false;
        table.bookedBy = null;
        table.bookingTime = null;
        
        await table.save();
        
        res.json({ success: true, message: "Table released successfully", table });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error releasing table" });
    }
};