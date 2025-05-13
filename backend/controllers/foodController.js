import foodModel from "../models/foodModel.js";
import fs from 'fs'

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find().sort({ orderCount: -1 })
        
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// add food
const addFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "Image is required" });
        }

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: req.file.filename,
            orderCount: 0
        })

        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        // If there's an error, remove the uploaded file
        if (req.file) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Delete the image file
        if (food.image) {
            fs.unlink(`uploads/${food.image}`, () => {});
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateAvailable = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }
        
        food.available = !food.available;
        await food.save();
        res.json({ success: true, message: "Food Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Get recommended foods
const getRecommendedFood = async (req, res) => {
    try {
        const recommendedFoods = await foodModel.find({ available: true })
            .sort({ orderCount: -1, lastOrdered: -1 })
            .limit(8);
        
        res.json({ success: true, data: recommendedFoods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { listFood, addFood, removeFood, updateAvailable, getRecommendedFood };