import Table from "../models/tableModel.js";

// Initialize tables if they don't exist
export const initializeTables = async () => {
    try {
        const existingTables = await Table.countDocuments();
        if (existingTables === 0) {
            const tables = Array.from({ length: 10 }, (_, i) => ({
                tableNumber: i + 1,
                capacity: 4,
                status: 'available'
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
        
        if (table.status !== 'available') {
            return res.status(400).json({ success: false, message: "Table is not available" });
        }
        
        table.status = 'pending';
        table.bookedBy = userId;
        table.bookingTime = new Date();
        
        await table.save();
        
        res.json({ success: true, message: "Table booking request sent", table });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error booking table" });
    }
};

// Approve or reject booking
export const handleBookingRequest = async (req, res) => {
    try {
        const { tableNumber, action } = req.body;
        
        const table = await Table.findOne({ tableNumber });
        
        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }
        
        if (table.status !== 'pending') {
            return res.status(400).json({ success: false, message: "No pending booking for this table" });
        }
        
        if (action === 'approve') {
            table.status = 'booked';
            table.isBooked = true;
        } else if (action === 'reject') {
            table.status = 'available';
            table.isBooked = false;
            table.bookedBy = null;
            table.bookingTime = null;
        }
        
        await table.save();
        
        res.json({ 
            success: true, 
            message: `Booking ${action}ed successfully`, 
            table 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error handling booking request" });
    }
};

// Mark table as available
export const markTableAvailable = async (req, res) => {
    try {
        const { tableNumber } = req.body;
        
        const table = await Table.findOne({ tableNumber });
        
        if (!table) {
            return res.status(404).json({ success: false, message: "Table not found" });
        }
        
        table.status = 'available';
        table.isBooked = false;
        table.bookedBy = null;
        table.bookingTime = null;
        
        await table.save();
        
        res.json({ success: true, message: "Table marked as available", table });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating table status" });
    }
};