import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    supplier: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    minStock: {
        type: Number,
        required: true,
        default: 0
    },
    reorderQty: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
    },
    lastRestock: {
        type: Date,
        default: Date.now
    },
    restockQty: {
        type: Number,
        default: 0
    },
    restockPrice: {
        type: Number,
        default: 0
    },
    totalCost: {
        type: Number,
        default: 0
    },
    unitsSold: {
        type: Number,
        default: 0
    },
    wastage: {
        type: Number,
        default: 0
    },
    manufacturingDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
}, {
    timestamps: true
});


const Stock = mongoose.model("Stock", stockSchema);
export default Stock; 