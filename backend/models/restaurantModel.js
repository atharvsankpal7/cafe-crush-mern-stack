import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    branchId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    branchName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    contactNo: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

export default mongoose.model("Restaurant", restaurantSchema);