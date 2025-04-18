import mongoose from "mongoose"; // ✅ Import Mongoose

const staffSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true },
    salary: { type: Number, required: true },
    photo: { type: String, required: false }, // Stores image URL or Base64 string
    role: { type: String, required: true, default: "manager", enum: ["manager", "admin"] }
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
