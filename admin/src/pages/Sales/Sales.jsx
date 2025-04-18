import React, { useState, useEffect } from "react";
import "./Sales.css";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";

const Sales = () => {
    const [allOrders, setAllOrders] = useState([]); // Store all orders
    const [filteredOrders, setFilteredOrders] = useState([]); // Store filtered orders
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    useEffect(() => {
        fetchData();
    }, [filter]); // Only fetch when filter type changes, not date range

    useEffect(() => {
        // Apply date filtering client-side
        applyFilters();
    }, [dateRange, allOrders]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all orders based on the time period filter (all, today, week, month)
            let url = `http://localhost:4000/api/sales/list?filter=${filter}`;
            
            const response = await fetch(url, {
                headers: { "token": localStorage.getItem("token") }
            });
            const ordersData = await response.json();
            setAllOrders(ordersData);
            
            // Initial filtering will be applied by the useEffect
        } catch (error) {
            toast.error("Error fetching data!");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...allOrders];
        
        // Apply date range filter if both dates are provided
        if (dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            // Set endDate to the end of the day
            endDate.setHours(23, 59, 59, 999);
            
            result = result.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }
        
        setFilteredOrders(result);
        generateSummary(result);
    };

    const generateSummary = (orders) => {
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
        const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
        const paymentMethodSummary = orders.reduce((acc, order) => {
            const method = order.payment ? "Paid" : "Unpaid";
            acc[method] = (acc[method] || 0) + order.amount;
            return acc;
        }, {});

        setSummary({ totalOrders, totalAmount, averageOrderValue, paymentMethodSummary });
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await fetch(`http://localhost:4000/api/sales/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "token": localStorage.getItem("token")
                },
                body: JSON.stringify({ status: newStatus })
            });
            toast.success("Order status updated successfully!");
            
            // Update the status locally without refetching
            setAllOrders(prevOrders => {
                const updated = prevOrders.map(order => 
                    order._id === orderId ? {...order, status: newStatus} : order
                );
                return updated;
            });
        } catch (error) {
            toast.error("Failed to update order status!");
        }
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const resetDateFilter = () => {
        setDateRange({ startDate: "", endDate: "" });
    };

    const downloadReport = () => {
        const headers = ["Date", "Transaction ID", "Customer", "Amount", "Status", "Payment Method"];
        const csvContent = [
            headers.join(","),
            ...filteredOrders.map(order => [
                new Date(order.date).toLocaleDateString(),
                order._id,
                `${order.address.firstName} ${order.address.lastName}`,
                order.amount,
                order.status,
                order.payment ? "Paid" : "Unpaid"
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="sales-container">
            <div className="sales-header">
                <h2>Sales & Payment Management</h2>
                <button className="download-btn" onClick={downloadReport}>
                    <FaDownload /> Download Report
                </button>
            </div>

            <div className="filters-container p-1000">
                <div className="filter-group">
                    <label>Time Period:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Custom Date Range:</label>
                    <input 
                        type="date" 
                        name="startDate" 
                        value={dateRange.startDate} 
                        onChange={(e) => handleDateChange("startDate", e.target.value)} 
                        max={today}
                    />
                    <input 
                        type="date" 
                        name="endDate" 
                        value={dateRange.endDate} 
                        onChange={(e) => handleDateChange("endDate", e.target.value)} 
                        max={today}
                    />
                    {(dateRange.startDate || dateRange.endDate) && (
                        <button className="reset-btn" onClick={resetDateFilter}>Reset</button>
                    )}
                </div>
            </div>

            {summary && (
                <div className="summary-cards">
                    <div className="summary-card"><h3>Total Orders</h3><p>{summary.totalOrders}</p></div>
                    <div className="summary-card"><h3>Total Revenue</h3><p>₹{summary.totalAmount?.toFixed(2)}</p></div>
                    <div className="summary-card"><h3>Average Order Value</h3><p>₹{summary.averageOrderValue?.toFixed(2)}</p></div>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>{new Date(order.date).toLocaleDateString()}</td>
                                        <td>{`${order.address.firstName} ${order.address.lastName}`}</td>
                                        <td>₹{order.amount?.toFixed(2)}</td>
                                        <td>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-orders">No orders found for selected filters</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Sales;