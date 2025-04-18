import Staff from "../models/staffModel.js";
import { createToken } from "./userController.js";
import fs from 'fs';

// Add new staff
export const addStaff = async (req, res) => {
  try {
    const staffData = { ...req.body };
    
    // Add photo filename if image was uploaded
    if (req.file) {
      staffData.photo = req.file.filename;
    }

    const newStaff = new Staff(staffData);
     await newStaff.save();
    
    res.status(201).json({ 
      message: "Staff added successfully", 
      staff: newStaff 
    });
  } catch (error) {
    // Remove uploaded file if there was an error
    if (req.file) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
    }
    console.error("Error adding staff:", error);
    res.status(500).json({ message: "Error adding staff", error });
  }
};

// Get all staff members
export const listStaff = async (req, res) => {
  try {
    const staffList = await Staff.find({ role: "manager" });
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving staff", error });
  }
};

// Update staff details
export const updateStaff = async (req, res) => {
  try {
    const { email, ...updateData } = req.body;
    
    // Add new photo if uploaded
    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
      // Remove uploaded file if staff not found
      if (req.file) {
        fs.unlink(`uploads/${req.file.filename}`, () => {});
      }
      return res.status(404).json({ message: "Staff not found" });
    }

    // Remove old photo if new one is uploaded
    if (req.file && staff.photo) {
      fs.unlink(`uploads/${staff.photo}`, () => {});
    }

    const updatedStaff = await Staff.findOneAndUpdate(
      { email }, 
      updateData,
      { new: true }
    );

    res.status(200).json({ 
      message: "Staff updated successfully", 
      staff: updatedStaff 
    });
  } catch (error) {
    // Remove uploaded file if there was an error
    if (req.file) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
    }
    console.log(error);
    res.status(500).json({ message: "Error updating staff", error });
  }
};

// Delete staff
export const removeStaff = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Remove staff photo if exists
    if (staff.photo) {
      fs.unlink(`uploads/${staff.photo}`, () => {});
    }

    await Staff.findByIdAndDelete(staff._id);
    return res.status(200).json({ message: "Staff removed successfully" });
  } catch (error) {
    console.error("Error in removeStaff:", error);
    return res.status(500).json({ 
      message: "Error deleting staff", 
      error: error.message 
    });
  }
};

// Login staff
export const loginStaff = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Staff.findOne({ email: email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = user.password === password;

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};