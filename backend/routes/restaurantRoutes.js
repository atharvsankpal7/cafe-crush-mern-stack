import express from "express";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";
import {
    listRestaurants,
    getRestaurant,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant
} from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

// Configure multer for restaurant images
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// All routes require authentication
restaurantRouter.use(authMiddleware);

// List all restaurants
restaurantRouter.get("/list", listRestaurants);

// Get single restaurant
restaurantRouter.get("/:id", getRestaurant);

// Add new restaurant
restaurantRouter.post("/add", upload.single('image'), addRestaurant);

// Update restaurant
restaurantRouter.put("/:id", upload.single('image'), updateRestaurant);

// Delete restaurant
restaurantRouter.delete("/:id", deleteRestaurant);

export default restaurantRouter;