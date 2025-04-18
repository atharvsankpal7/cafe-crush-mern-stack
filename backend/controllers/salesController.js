import Order from "../models/orderModel.js";

// Get all orders with filters
export const listOrders = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    let query = {};

    // Apply date filters
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (filter) {
      const now = new Date();
      switch (filter) {
        case "today":
          query.createdAt = {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lte: new Date(now.setHours(23, 59, 59, 999)),
          };
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          query.createdAt = {
            $gte: weekStart,
            $lte: new Date(),
          };
          break;
        case "month":
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          query.createdAt = {
            $gte: monthStart,
            $lte: new Date(),
          };
          break;
      }
    }

    const orders = await Order.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in listOrders:", error);
    res
      .status(500)
      .json({ message: "Error retrieving orders data", error: error.message });
  }
};
// Get single order details
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "name email address")
      .populate("items.product", "name price description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    res
      .status(500)
      .json({
        message: "Error retrieving order details",
        error: error.message,
      });
  }
};

// Get orders summary
export const getOrdersSummary = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          paymentMethods: {
            $push: {
              method: "$paymentMethod",
              amount: "$totalAmount",
            },
          },
          orderStatus: {
            $push: {
              status: "$status",
              count: 1,
            },
          },
        },
      },
    ]);

    // Process the results
    const result = summary[0] || {
      totalOrders: 0,
      totalAmount: 0,
      averageOrderValue: 0,
      paymentMethods: [],
      orderStatus: [],
    };

    // Group payment methods
    const paymentMethodSummary = result.paymentMethods.reduce((acc, curr) => {
      if (!acc[curr.method]) {
        acc[curr.method] = 0;
      }
      acc[curr.method] += curr.amount;
      return acc;
    }, {});

    // Group order status
    const statusSummary = result.orderStatus.reduce((acc, curr) => {
      if (!acc[curr.status]) {
        acc[curr.status] = 0;
      }
      acc[curr.status] += curr.count;
      return acc;
    }, {});

    res.status(200).json({
      totalOrders: result.totalOrders,
      totalAmount: result.totalAmount,
      averageOrderValue: result.averageOrderValue,
      paymentMethodSummary,
      statusSummary,
    });
  } catch (error) {
    console.error("Error in getOrdersSummary:", error);
    res
      .status(500)
      .json({
        message: "Error retrieving orders summary",
        error: error.message,
      });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const payments = await Order.find(query)
      .select("createdAt paymentMethod totalAmount status transactionId")
      .sort({ createdAt: -1 });

    const paymentHistory = payments.map((payment) => ({
      date: payment.createdAt,
      transactionId: payment.transactionId,
      amount: payment.totalAmount,
      method: payment.paymentMethod,
      status: payment.status,
    }));

    res.status(200).json(paymentHistory);
  } catch (error) {
    console.error("Error in getPaymentHistory:", error);
    res
      .status(500)
      .json({
        message: "Error retrieving payment history",
        error: error.message,
      });
  }
};
