    import React, { useState, useEffect } from "react";
    import "./StockManagement.css";
    import { toast } from "react-toastify";
    import { FaDownload } from "react-icons/fa";

    const StockManagement = () => {
        const [stockList, setStockList] = useState([]);
        const [summary, setSummary] = useState(null);
        const [loading, setLoading] = useState(false);
        const [formData, setFormData] = useState({
            product: "",
            category: "",
            supplier: "",
            stock: "",
            minStock: "",
            reorderQty: "",
            unit: "",
            restockQty: "",
            restockPrice: "",
            manufacturingDate: "",
            expiryDate: ""
        });
        const [editId, setEditId] = useState(null);
        const [showModal, setShowModal] = useState(false);
        const [selectedItem, setSelectedItem] = useState(null);

        useEffect(() => {
            fetchStockData();
        }, []);

        const fetchStockData = async () => {
            setLoading(true);
            try {
                const [stockRes, summaryRes] = await Promise.all([
                    fetch("http://localhost:4000/api/stock/list", {
                        headers: {
                            "token": localStorage.getItem("token")
                        }
                    }),
                    fetch("http://localhost:4000/api/stock/summary", {
                        headers: {
                            "token": localStorage.getItem("token")
                        }
                    })
                ]);

                const [stockData, summaryData] = await Promise.all([
                    stockRes.json(),
                    summaryRes.json()
                ]);

                setStockList(stockData);
                setSummary(summaryData);
            } catch (error) {
                toast.error("Error fetching stock data!");
            } finally {
                setLoading(false);
            }
        };

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleSubmit = async () => {
            // Validate required fields
            const requiredFields = [
                "product", "category", "supplier", "stock", "minStock",
                "reorderQty", "unit", "restockQty", "restockPrice",
                "manufacturingDate", "expiryDate"
            ];

            const missingFields = requiredFields.filter(field => !formData[field]);
            if (missingFields.length > 0) {
                toast.warn("Please fill all required fields!");
                return;
            }

            try {
                const url = editId 
                    ? `http://localhost:4000/api/stock/${editId}`
                    : "http://localhost:4000/api/stock/add";
                
                const method = editId ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "token": localStorage.getItem("token")
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error("Failed to save stock item");

                toast.success(editId ? "Stock item updated successfully!" : "Stock item added successfully!");
                resetForm();
                fetchStockData();
            } catch (error) {
                toast.error("Failed to save stock item!");
            }
        };

        const handleDelete = async (id) => {
            if (!window.confirm("Are you sure you want to delete this stock item?")) return;

            try {
                const response = await fetch(`http://localhost:4000/api/stock/${id}`, {
                    method: "DELETE",
                    headers: {
                        "token": localStorage.getItem("token")
                    }
                });

                if (!response.ok) throw new Error("Failed to delete stock item");

                toast.success("Stock item deleted successfully!");
                fetchStockData();
            } catch (error) {
                toast.error("Failed to delete stock item!");
            }
        };

        const handleEdit = (item) => {
            setFormData(item);
            setEditId(item._id);
            setShowModal(true);
        };

        const handleUpdateQuantity = async (id, quantity, type) => {
            try {
                const response = await fetch(`http://localhost:4000/api/stock/${id}/quantity`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "token": localStorage.getItem("token")
                    },
                    body: JSON.stringify({ quantity, type })
                });

                if (!response.ok) throw new Error("Failed to update quantity");

                toast.success("Stock quantity updated successfully!");
                fetchStockData();
            } catch (error) {
                toast.error("Failed to update stock quantity!");
            }
        };

        const resetForm = () => {
            setFormData({
                product: "",
                category: "",
                supplier: "",
                stock: "",
                minStock: "",
                reorderQty: "",
                unit: "",
                restockQty: "",
                restockPrice: "",
                manufacturingDate: "",
                expiryDate: ""
            });
            setEditId(null);
            setShowModal(false);
        };

        const downloadReport = () => {
            const headers = [
                "Product", "Category", "Supplier", "Stock", "Min Stock",
                "Reorder Qty", "Unit", "Last Restock", "Restock Qty",
                "Restock Price", "Total Cost", "Units Sold", "Wastage",
                "Manufacturing Date", "Expiry Date"
            ];

            const csvContent = [
                headers.join(","),
                ...stockList.map(item => [
                    item.product,
                    item.category,
                    item.supplier,
                    item.stock,
                    item.minStock,
                    item.reorderQty,
                    item.unit,
                    new Date(item.lastRestock).toLocaleDateString(),
                    item.restockQty,
                    item.restockPrice,
                    item.totalCost,
                    item.unitsSold,
                    item.wastage,
                    new Date(item.manufacturingDate).toLocaleDateString(),
                    new Date(item.expiryDate).toLocaleDateString()
                ].join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        };

        return (
            <div className="stock-management-container">
                <div className="stock-header">
                    <h2>Stock Management</h2>
                    <button className="download-btn" onClick={downloadReport}>
                        <FaDownload /> Download Report
                    </button>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Total Items</h3>
                            <p>{summary.totalItems}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Total Stock Value</h3>
                            <p>₹{summary.totalValue?.toFixed(2)}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Low Stock Items</h3>
                            <p>{summary.lowStockItems}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Total Wastage</h3>
                            <p>{summary.totalWastage}</p>
                        </div>
                    </div>
                )}

                {/* Add/Edit Form */}
                <div className="form-container">
                    <h3>{editId ? "Edit Stock Item" : "Add New Stock Item"}</h3>
                    <div className="form-grid">
                        <input
                            type="text"
                            name="product"
                            placeholder="Product Name"
                            value={formData.product}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="supplier"
                            placeholder="Supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="stock"
                            placeholder="Current Stock"
                            value={formData.stock}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="minStock"
                            placeholder="Minimum Stock"
                            value={formData.minStock}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="reorderQty"
                            placeholder="Reorder Quantity"
                            value={formData.reorderQty}
                            onChange={handleChange}
                        />
                        <select name="unit" value={formData.unit} onChange={handleChange}>
                            <option value="">Select Unit</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="g">Grams (g)</option>
                            <option value="l">Liters (l)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="pcs">Pieces</option>
                            <option value="boxes">Boxes</option>
                            <option value="packets">Packets</option>
                        </select>
                        <input
                            type="number"
                            name="restockQty"
                            placeholder="Restock Quantity"
                            value={formData.restockQty}
                            onChange={handleChange}
                        />
                        <input
                            type="number"
                            name="restockPrice"
                            placeholder="Restock Price"
                            value={formData.restockPrice}
                            onChange={handleChange}
                        />
                        <input
                            type="date"
                            name="manufacturingDate"
                            value={formData.manufacturingDate}
                            onChange={handleChange}
                        />
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button onClick={handleSubmit} className="submit-btn">
                            {editId ? "Update" : "Add"} Stock Item
                        </button>
                        {editId && (
                            <button onClick={resetForm} className="cancel-btn">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Stock Table */}
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Supplier</th>
                                    <th>Stock</th>
                                    <th>Min Stock</th>
                                    <th>Unit</th>
                                    <th>Last Restock</th>
                                    <th>Expiry Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading && stockList && stockList.map((item) => (
                                    <tr key={item._id}>
                                        <td>{item.product}</td>
                                        <td>{item.category}</td>
                                        <td>{item.supplier}</td>
                                        <td>{item.stock}</td>
                                        <td>{item.minStock}</td>
                                        <td>{item.unit}</td>
                                        <td>{new Date(item.lastRestock).toLocaleDateString()}</td>
                                        <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    className="update-qty-btn"
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    Update Qty
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Update Quantity Modal */}
                {selectedItem && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-modal" onClick={() => setSelectedItem(null)}>×</button>
                            <h3>Update Stock Quantity</h3>
                            <div className="update-qty-form">
                                <div className="current-stock">
                                    <p>Current Stock: {selectedItem.stock} {selectedItem.unit}</p>
                                </div>
                                <div className="qty-inputs">
                                    <div className="input-group">
                                        <label>Quantity:</label>
                                        <input
                                            type="number"
                                            id="updateQty"
                                            min="1"
                                            max={selectedItem.stock}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Type:</label>
                                        <select id="updateType">
                                            <option value="sale">Sale</option>
                                            <option value="wastage">Wastage</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    className="submit-btn"
                                    onClick={() => {
                                        const qty = document.getElementById("updateQty").value;
                                        const type = document.getElementById("updateType").value;
                                        if (qty && qty > 0) {
                                            handleUpdateQuantity(selectedItem._id, parseInt(qty), type);
                                            setSelectedItem(null);
                                        }
                                    }}
                                >
                                    Update Quantity
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default StockManagement;
