import Restaurant from "../models/restaurantModel.js";
import fs from 'fs';

// List all restaurants
export const listRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find()
            .sort({ createdAt: -1 });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching restaurants", 
            error: error.message 
        });
    }
};

// Get single restaurant
export const getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching restaurant", 
            error: error.message 
        });
    }
};

// Add new restaurant
export const addRestaurant = async (req, res) => {
    try {
        const { branchId, branchName, address, contactNo } = req.body;

        // Check if branchId already exists
        const existingRestaurant = await Restaurant.findOne({ branchId });
        if (existingRestaurant) {
            // Remove uploaded file if branch exists
            if (req.file) {
                fs.unlink(`uploads/${req.file.filename}`, () => {});
            }
            return res.status(400).json({ message: "Branch ID already exists" });
        }

        const restaurant = new Restaurant({
            branchId,
            branchName,
            address,
            contactNo,
            image: req.file ? req.file.filename : null
        });

        await restaurant.save();
        res.status(201).json({ 
            message: "Restaurant added successfully", 
            restaurant 
        });
    } catch (error) {
        // Remove uploaded file if there was an error
        if (req.file) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        res.status(500).json({ 
            message: "Error adding restaurant", 
            error: error.message 
        });
    }
};

// Update restaurant
export const updateRestaurant = async (req, res) => {
    try {
        const { branchId, branchName, address, contactNo } = req.body;

        // Check if branchId exists for other restaurants
        const existingRestaurant = await Restaurant.findOne({
            branchId,
            _id: { $ne: req.params.id }
        });
        
        if (existingRestaurant) {
            // Remove uploaded file if branch exists
            if (req.file) {
                fs.unlink(`uploads/${req.file.filename}`, () => {});
            }
            return res.status(400).json({ message: "Branch ID already exists" });
        }

        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            // Remove uploaded file if restaurant not found
            if (req.file) {
                fs.unlink(`uploads/${req.file.filename}`, () => {});
            }
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Remove old image if new one is uploaded
        if (req.file && restaurant.image) {
            fs.unlink(`uploads/${restaurant.image}`, () => {});
        }

        restaurant.branchId = branchId;
        restaurant.branchName = branchName;
        restaurant.address = address;
        restaurant.contactNo = contactNo;
        if (req.file) {
            restaurant.image = req.file.filename;
        }

        await restaurant.save();
        res.json({ 
            message: "Restaurant updated successfully", 
            restaurant 
        });
    } catch (error) {
        // Remove uploaded file if there was an error
        if (req.file) {
            fs.unlink(`uploads/${req.file.filename}`, () => {});
        }
        res.status(500).json({ 
            message: "Error updating restaurant", 
            error: error.message 
        });
    }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Remove restaurant image if exists
        if (restaurant.image) {
            fs.unlink(`uploads/${restaurant.image}`, () => {});
        }

        await restaurant.deleteOne();
        res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting restaurant", 
            error: error.message 
        });
    }
};