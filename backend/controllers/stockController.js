import Stock from "../models/stockModel.js";

// Get all stock items
export const listStock = async (req, res) => {
  try {
    const stockList = await Stock.find().sort({ createdAt: -1 });

    res.status(200).json(stockList);
  } catch (error) {
    console.error("Error in listStock:", error);
    res
      .status(500)
      .json({ message: "Error retrieving stock data", error: error.message });
  }
};

// Add new stock item
export const addStockItem = async (req, res) => {
  try {
    const {
      product,
      category,
      supplier,
      stock,
      minStock,
      reorderQty,
      unit,
      restockQty,
      restockPrice,
      manufacturingDate,
      expiryDate,
    } = req.body;

    // Calculate total cost
    const totalCost = restockQty * restockPrice;

    const newStockItem = new Stock({
      product,
      category,
      supplier,
      stock,
      minStock,
      reorderQty,
      unit,
      restockQty,
      restockPrice,
      totalCost,
      manufacturingDate,
      expiryDate,
    });

    await newStockItem.save();
    res
      .status(201)
      .json({
        message: "Stock item added successfully",
        stockItem: newStockItem,
      });
  } catch (error) {
    console.error("Error in addStockItem:", error);
    res
      .status(500)
      .json({ message: "Error adding stock item", error: error.message });
  }
};

// Update stock item
export const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If restockQty and restockPrice are provided, update totalCost
    if (updateData.restockQty && updateData.restockPrice) {
      updateData.totalCost = updateData.restockQty * updateData.restockPrice;
    }

    const updatedStockItem = await Stock.findByIdAndUpdate(
      id,
      {
        ...updateData,
      },
      { new: true }
    );

    if (!updatedStockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res
      .status(200)
      .json({
        message: "Stock item updated successfully",
        stockItem: updatedStockItem,
      });
  } catch (error) {
    console.error("Error in updateStockItem:", error);
    res
      .status(500)
      .json({ message: "Error updating stock item", error: error.message });
  }
};

// Delete stock item
export const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStockItem = await Stock.findByIdAndDelete(id);

    if (!deletedStockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.status(200).json({ message: "Stock item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStockItem:", error);
    res
      .status(500)
      .json({ message: "Error deleting stock item", error: error.message });
  }
};

// Update stock quantity (for sales)
export const updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'sale' or 'wastage'

    const stockItem = await Stock.findById(id);
    if (!stockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    if (type === "sale") {
      stockItem.stock -= quantity;
      stockItem.unitsSold += quantity;
    } else if (type === "wastage") {
      stockItem.stock -= quantity;
      stockItem.wastage += quantity;
    }

    await stockItem.save();

    res
      .status(200)
      .json({ message: "Stock quantity updated successfully", stockItem });
  } catch (error) {
    console.error("Error in updateStockQuantity:", error);
    res
      .status(500)
      .json({ message: "Error updating stock quantity", error: error.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Stock.find({
      $expr: {
        $lte: ["$stock", "$minStock"],
      },
    })
      .populate("product", "name price description")
      .sort({ stock: 1 });

    res.status(200).json(lowStockItems);
  } catch (error) {
    console.error("Error in getLowStockItems:", error);
    res
      .status(500)
      .json({
        message: "Error retrieving low stock items",
        error: error.message,
      });
  }
};

// Get stock summary
export const getStockSummary = async (req, res) => {
  try {
    const summary = await Stock.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$stock", "$restockPrice"] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0],
            },
          },
          totalWastage: { $sum: "$wastage" },
          totalUnitsSold: { $sum: "$unitsSold" },
        },
      },
    ]);

    res.status(200).json(
      summary[0] || {
        totalItems: 0,
        totalStock: 0,
        totalValue: 0,
        lowStockItems: 0,
        totalWastage: 0,
        totalUnitsSold: 0,
      }
    );
  } catch (error) {
    console.error("Error in getStockSummary:", error);
    res
      .status(500)
      .json({
        message: "Error retrieving stock summary",
        error: error.message,
      });
  }
};
