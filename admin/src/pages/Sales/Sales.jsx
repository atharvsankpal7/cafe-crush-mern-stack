import React, { useState, useEffect } from "react";
import "./Sales.css";
import { toast } from "react-toastify";
import { FaDownload } from "react-icons/fa";

const Sales = () => {
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    useEffect(() => {
        fetchData();
    }, [filter, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:4000/api/sales/list?filter=${filter}`;
            if (dateRange.startDate && dateRange.endDate) {
                url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            }

            const response = await fetch(url, {
                headers: { "token": localStorage.getItem("token") }
            });
            const ordersData = await response.json();
            processOrders(ordersData);
        } catch (error) {
            toast.error("Error fetching data!");
        } finally {
            setLoading(false);
        }
    };

    const processOrders = (ordersData) => {
        setOrders(ordersData);
        
        const totalOrders = ordersData.length;
        const totalAmount = ordersData.reduce((sum, order) => sum + order.amount, 0);
        const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
        const paymentMethodSummary = ordersData.reduce((acc, order) => {
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
            fetchData();
        } catch (error) {
            toast.error("Failed to update order status!");
        }
    };

    const downloadReport = () => {
        const headers = ["Date", "Transaction ID", "Customer", "Amount", "Status", "Payment Method"];
        const csvContent = [
            headers.join(","),
            ...orders.map(order => [
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
                    </select>
                </div>
                <div className="filter-group">
                    <label>Custom Date Range:</label>
                    <input type="date" name="startDate" value={dateRange.startDate} onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))} />
                    <input type="date" name="endDate" value={dateRange.endDate} onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))} />
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
                                <th>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{new Date(order.date).toLocaleDateString()}</td>
                                    <td>{`${order.address.firstName} ${order.address.lastName}`}</td>
                                    <td>₹{order.amount?.toFixed(2)}</td>
                                    <td>
                                        <select value={order.status} onChange={(e) => handleStatusUpdate(order._id, e.target.value)}>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>{order.payment ? "Paid" : "Unpaid"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Sales;
