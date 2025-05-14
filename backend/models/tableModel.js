import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        default: 4
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: String,
        default: null
    },
    bookingTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // Duration in minutes
        default: 120 // Default 2 hours
    },
    status: {
        type: String,
        enum: ['available', 'pending', 'booked', 'completed'],
        default: 'available'
    }
});

const Table = mongoose.model("Table", tableSchema);
export default Table;